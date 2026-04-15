import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  EntityStatus,
  InventoryItemType,
  MovementType,
  OrderProductType,
  OrderStatus,
} from '../../generated/prisma/enums.js';
import { RealtimeGateway } from '../../socket/realtime.gateway.js';
import { CreateClientDto } from './dto/create-client.dto.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';

@Injectable()
export class CrmService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  private async allocatePlaceholderPhone(): Promise<string> {
    for (let i = 0; i < 50; i += 1) {
      const suffix = `${90000000 + Math.floor(Math.random() * 9999999)}`.slice(0, 8);
      const phone = `+99888${suffix}`;
      const exists = await this.prisma.client.findUnique({ where: { phone } });
      if (!exists) {
        return phone;
      }
    }
    throw new ConflictException('Could not allocate unique client phone');
  }

  async deletePayment(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.prisma.$transaction(async (tx) => {
      if (payment.orderId) {
        const order = await tx.order.findUnique({
          where: { id: payment.orderId },
        });

        if (order) {
          await tx.order.update({
            where: { id: payment.orderId },
            data: {
              paidAmount: Math.max(order.paidAmount - payment.amount, 0),
              debtAmount: order.debtAmount + payment.amount,
              status: OrderStatus.PENDING,
            },
          });
        }
      }

      await tx.payment.delete({
        where: { id },
      });

      return { success: true };
    });
  }

  async createClient(dto: CreateClientDto) {
    const phone = dto.phone?.trim() || (await this.allocatePlaceholderPhone());

    const existing = await this.prisma.client.findUnique({
      where: { phone },
    });

    if (existing) {
      throw new ConflictException('Client phone already exists');
    }

    return this.prisma.client.create({
      data: {
        ...dto,
        phone,
      },
    });
  }

  getClients() {
    return this.prisma.client.findMany({
      include: {
        orders: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createOrder(dto: CreateOrderDto, createdById?: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientId },
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const order = await this.prisma.$transaction(async (tx) => {
      for (const item of dto.items) {
        if (
          item.productType === OrderProductType.SEMI_PRODUCT &&
          !item.semiProductId
        ) {
          throw new BadRequestException('semiProductId is required');
        }

        if (
          item.productType === OrderProductType.FINISHED_PRODUCT &&
          !item.finishedProductId
        ) {
          throw new BadRequestException('finishedProductId is required');
        }

        const balance = await tx.inventoryBalance.findFirst({
          where:
            item.productType === OrderProductType.SEMI_PRODUCT
              ? { semiProductId: item.semiProductId }
              : { finishedProductId: item.finishedProductId },
        });

        if (!balance || balance.quantity < item.quantity) {
          throw new BadRequestException('Insufficient stock for order item');
        }
      }

      const totalAmount = dto.items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0,
      );
      const paidAmount = dto.paidAmount ?? 0;
      const debtAmount = totalAmount - paidAmount;

      const savedOrder = await tx.order.create({
        data: {
          clientId: dto.clientId,
          createdById,
          status: dto.status ?? OrderStatus.PENDING,
          totalAmount,
          paidAmount,
          debtAmount,
          items: {
            create: dto.items.map((item) => ({
              productType: item.productType,
              semiProductId: item.semiProductId,
              finishedProductId: item.finishedProductId,
              quantity: item.quantity,
              price: item.price,
              total: item.quantity * item.price,
            })),
          },
        },
        include: { items: true, client: true },
      });

      for (const item of dto.items) {
        const balance = await tx.inventoryBalance.findFirstOrThrow({
          where:
            item.productType === OrderProductType.SEMI_PRODUCT
              ? { semiProductId: item.semiProductId }
              : { finishedProductId: item.finishedProductId },
        });

        await tx.inventoryBalance.update({
          where: { id: balance.id },
          data: { quantity: balance.quantity - item.quantity },
        });

        await tx.inventoryMovement.create({
          data: {
            itemType:
              item.productType === OrderProductType.SEMI_PRODUCT
                ? InventoryItemType.SEMI_PRODUCT
                : InventoryItemType.FINISHED_PRODUCT,
            movementType: MovementType.CONSUMPTION,
            quantity: item.quantity,
            previousQuantity: balance.quantity,
            newQuantity: balance.quantity - item.quantity,
            semiProductId: item.semiProductId,
            finishedProductId: item.finishedProductId,
            createdById,
            referenceType: 'order',
            referenceId: savedOrder.id,
            status: EntityStatus.COMPLETED,
          },
        });
      }

      if (paidAmount > 0) {
        await tx.payment.create({
          data: {
            clientId: dto.clientId,
            orderId: savedOrder.id,
            amount: paidAmount,
            description: 'Initial order payment',
          },
        });
      }

      return savedOrder;
    });

    this.realtimeGateway.emitOrderUpdated(order);
    this.realtimeGateway.emitWarehouseUpdated({
      source: 'order',
      orderId: order.id,
    });

    return order;
  }

  async createPayment(dto: CreatePaymentDto) {
    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientId },
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: dto,
      });

      if (dto.orderId) {
        const order = await tx.order.findUnique({
          where: { id: dto.orderId },
        });

        if (!order) {
          throw new NotFoundException('Order not found');
        }

        await tx.order.update({
          where: { id: dto.orderId },
          data: {
            paidAmount: order.paidAmount + dto.amount,
            debtAmount: Math.max(order.debtAmount - dto.amount, 0),
            status:
              order.debtAmount - dto.amount <= 0
                ? OrderStatus.COMPLETED
                : order.status,
          },
        });
      }

      return payment;
    });
  }

  getOrders() {
    return this.prisma.order.findMany({
      include: {
        client: true,
        items: {
          include: {
            semiProduct: true,
            finishedProduct: true,
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  getPayments() {
    return this.prisma.payment.findMany({
      include: {
        client: true,
        order: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
