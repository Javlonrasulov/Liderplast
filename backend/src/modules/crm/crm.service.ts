import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';

type Tx = Prisma.TransactionClient;
import {
  EntityStatus,
  InventoryItemType,
  MovementType,
  OrderProductType,
  OrderStatus,
  PurchaseOrderCurrency,
} from '../../generated/prisma/enums.js';
import { RealtimeGateway } from '../../socket/realtime.gateway.js';
import { CreateClientDto } from './dto/create-client.dto.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderDto } from './dto/update-order.dto.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { UpdateClientDto } from './dto/update-client.dto.js';
import { KassaService } from '../finance/kassa.service.js';

/** Bazada `deletedAt` bo‘lmasa ham ishlaydi — o‘chirilgan mijoz telefoni `__del__` qatorini o‘z ichiga oladi */
function isClientRemoved(client: { phone: string }): boolean {
  return client.phone.includes('__del__');
}

@Injectable()
export class CrmService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly kassaService: KassaService,
  ) {}

  /** +998XXXXXXXXX yoki null (bo‘sh / to‘liq emas) */
  private normalizeClientPhone(input?: string | null): string | null {
    if (!input?.trim()) {
      return null;
    }
    const digits = input.replace(/\D/g, '');
    const national = digits.startsWith('998') ? digits.slice(3) : digits;
    if (national.length === 0) {
      return null;
    }
    if (national.length !== 9) {
      return null;
    }
    return `+998${national}`;
  }

  private parseOrderDate(ymd?: string): Date | undefined {
    if (!ymd?.trim()) {
      return undefined;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd.trim())) {
      throw new BadRequestException('Invalid order date');
    }
    return new Date(`${ymd.trim()}T12:00:00+05:00`);
  }

  private orderItemTotalUzs(item: {
    quantity: number;
    price: number;
    currency?: PurchaseOrderCurrency;
    fxRateToUzs?: number;
  }): number {
    const currency = item.currency ?? PurchaseOrderCurrency.UZS;
    if (currency === PurchaseOrderCurrency.UZS) {
      return item.quantity * item.price;
    }
    const fx = item.fxRateToUzs ?? 0;
    if (fx <= 0) {
      throw new BadRequestException('Exchange rate is required for foreign currency items');
    }
    return item.quantity * item.price * fx;
  }

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
    const normalized = this.normalizeClientPhone(dto.phone);
    const phone = normalized ?? (await this.allocatePlaceholderPhone());

    const existing = await this.prisma.client.findUnique({
      where: { phone },
    });

    if (existing) {
      throw new ConflictException('Client phone already exists');
    }

    const { phone: _ignored, ...rest } = dto;

    return this.prisma.client.create({
      data: {
        ...rest,
        phone,
      },
    });
  }

  async updateClient(id: string, dto: UpdateClientDto) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    if (isClientRemoved(client)) {
      throw new BadRequestException('Client already removed');
    }

    const data: {
      name?: string;
      phone?: string;
      address?: string | null;
      bankAccount?: string | null;
      bankName?: string | null;
      stir?: string | null;
      deliveryVehiclePlate?: string | null;
      deliveryDriverName?: string | null;
    } = {};

    if (dto.name !== undefined) {
      data.name = dto.name.trim();
    }

    if (dto.phone !== undefined) {
      const normalized = this.normalizeClientPhone(dto.phone);
      if (normalized) {
        const existing = await this.prisma.client.findUnique({ where: { phone: normalized } });
        if (existing && existing.id !== id) {
          throw new ConflictException('Client phone already exists');
        }
        data.phone = normalized;
      }
    }

    if (dto.address !== undefined) {
      data.address = dto.address.trim() || null;
    }

    if (dto.bankAccount !== undefined) {
      data.bankAccount = dto.bankAccount.trim() || null;
    }

    if (dto.bankName !== undefined) {
      data.bankName = dto.bankName.trim() || null;
    }

    if (dto.stir !== undefined) {
      data.stir = dto.stir.trim() || null;
    }

    if (dto.deliveryVehiclePlate !== undefined) {
      data.deliveryVehiclePlate = dto.deliveryVehiclePlate.trim() || null;
    }

    if (dto.deliveryDriverName !== undefined) {
      data.deliveryDriverName = dto.deliveryDriverName.trim() || null;
    }

    if (Object.keys(data).length === 0) {
      return client;
    }

    return this.prisma.client.update({
      where: { id },
      data,
    });
  }

  async deleteClient(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    if (isClientRemoved(client)) {
      throw new BadRequestException('Client already removed');
    }

    await this.prisma.client.update({
      where: { id },
      data: {
        phone: `${client.phone}__del__${id}`,
      },
    });

    return { success: true };
  }

  async getClients() {
    const clients = await this.prisma.client.findMany({
      where: { NOT: { phone: { contains: '__del__' } } },
      include: {
        orders: { orderBy: { createdAt: 'desc' } },
        payments: true,
        bankTransactions: {
          where: {
            OR: [
              { receiverAccount: { not: null } },
              { receiverBankName: { not: null } },
            ],
          },
          orderBy: [{ operationDate: 'desc' }, { createdAt: 'desc' }],
          take: 1,
          select: {
            receiverAccount: true,
            receiverBankName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return clients.map(({ bankTransactions, ...client }) => ({
      ...client,
      bankAccount:
        client.bankAccount ?? bankTransactions[0]?.receiverAccount?.trim() ?? null,
      bankName:
        client.bankName ?? bankTransactions[0]?.receiverBankName?.trim() ?? null,
    }));
  }

  private async assertOrderItemsStock(tx: Tx, items: CreateOrderDto['items']) {
    for (const item of items) {
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
  }

  private async restoreOrderItemsToStock(
    tx: Tx,
    orderId: string,
    items: Array<{
      productType: OrderProductType;
      semiProductId: string | null;
      finishedProductId: string | null;
      quantity: number;
    }>,
    createdById?: string,
  ) {
    for (const item of items) {
      const balance = await tx.inventoryBalance.findFirstOrThrow({
        where:
          item.productType === OrderProductType.SEMI_PRODUCT
            ? { semiProductId: item.semiProductId! }
            : { finishedProductId: item.finishedProductId! },
      });

      const newQuantity = balance.quantity + item.quantity;
      await tx.inventoryBalance.update({
        where: { id: balance.id },
        data: { quantity: newQuantity },
      });

      await tx.inventoryMovement.create({
        data: {
          itemType:
            item.productType === OrderProductType.SEMI_PRODUCT
              ? InventoryItemType.SEMI_PRODUCT
              : InventoryItemType.FINISHED_PRODUCT,
          movementType: MovementType.ADJUSTMENT,
          quantity: item.quantity,
          previousQuantity: balance.quantity,
          newQuantity,
          semiProductId: item.semiProductId,
          finishedProductId: item.finishedProductId,
          createdById,
          referenceType: 'order_edit',
          referenceId: orderId,
          status: EntityStatus.COMPLETED,
        },
      });
    }
  }

  private async consumeOrderItemsFromStock(
    tx: Tx,
    items: CreateOrderDto['items'],
    orderId: string,
    createdById?: string,
  ) {
    for (const item of items) {
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
          referenceId: orderId,
          status: EntityStatus.COMPLETED,
        },
      });
    }
  }

  async createOrder(dto: CreateOrderDto, createdById?: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientId },
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    if (isClientRemoved(client)) {
      throw new BadRequestException('Client has been removed');
    }

    const order = await this.prisma.$transaction(async (tx) => {
      await this.assertOrderItemsStock(tx, dto.items);

      const totalAmount = dto.items.reduce(
        (sum, item) => sum + this.orderItemTotalUzs(item),
        0,
      );
      const paidAmount = dto.paidAmount ?? 0;

      const savedOrder = await tx.order.create({
        data: {
          clientId: dto.clientId,
          createdById,
          status: dto.status ?? OrderStatus.PENDING,
          orderedAt: this.parseOrderDate(dto.orderedAt) ?? new Date(),
          totalAmount,
          paidAmount: 0,
          debtAmount: totalAmount,
          items: {
            create: dto.items.map((item) => {
              const total = this.orderItemTotalUzs(item);
              const currency = item.currency ?? PurchaseOrderCurrency.UZS;
              return {
                productType: item.productType,
                semiProductId: item.semiProductId,
                finishedProductId: item.finishedProductId,
                quantity: item.quantity,
                price: item.price,
                currency,
                fxRateToUzs:
                  currency === PurchaseOrderCurrency.UZS
                    ? null
                    : (item.fxRateToUzs ?? null),
                total,
              };
            }),
          },
        },
        include: { items: true, client: true },
      });

      await this.consumeOrderItemsFromStock(tx, dto.items, savedOrder.id, createdById);

      const { effectivePaid, debtAmount } =
        await this.kassaService.applySaleBalanceDeduction(tx, {
          clientId: dto.clientId,
          orderId: savedOrder.id,
          totalAmount,
          paidAmount,
          createdById,
        });

      const finalOrder = await tx.order.update({
        where: { id: savedOrder.id },
        data: {
          paidAmount: effectivePaid,
          debtAmount,
          status: debtAmount <= 0 ? OrderStatus.COMPLETED : (dto.status ?? OrderStatus.PENDING),
        },
        include: { items: true, client: true },
      });

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

      return finalOrder;
    });

    this.realtimeGateway.emitOrderUpdated(order);
    this.realtimeGateway.emitWarehouseUpdated({
      source: 'order',
      orderId: order.id,
    });

    return order;
  }

  async updateOrder(id: string, dto: UpdateOrderDto, updatedById?: string) {
    const existing = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, payments: true },
    });
    if (!existing) {
      throw new NotFoundException('Order not found');
    }

    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientId },
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    // Eski sotuv — ro‘yxatdan o‘chirilgan mijoz bilan ham tahrirlash (mijoz o‘zgarmasa)
    if (isClientRemoved(client) && dto.clientId !== existing.clientId) {
      throw new BadRequestException('Client has been removed');
    }

    if (dto.items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    const order = await this.prisma.$transaction(async (tx) => {
      await this.restoreOrderItemsToStock(tx, id, existing.items, updatedById);

      await this.assertOrderItemsStock(tx, dto.items);

      await this.kassaService.reverseSaleBalanceDeduction(tx, id);

      const totalAmount = dto.items.reduce(
        (sum, item) => sum + this.orderItemTotalUzs(item),
        0,
      );
      const paidAmount = dto.paidAmount ?? 0;
      if (paidAmount > totalAmount) {
        throw new BadRequestException('Paid amount cannot exceed order total');
      }

      await tx.orderItem.deleteMany({ where: { orderId: id } });

      const orderedAt = this.parseOrderDate(dto.orderedAt);

      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          clientId: dto.clientId,
          status: dto.status ?? OrderStatus.PENDING,
          ...(orderedAt ? { orderedAt } : {}),
          totalAmount,
          paidAmount: 0,
          debtAmount: totalAmount,
          items: {
            create: dto.items.map((item) => {
              const total = this.orderItemTotalUzs(item);
              const currency = item.currency ?? PurchaseOrderCurrency.UZS;
              return {
                productType: item.productType,
                semiProductId: item.semiProductId,
                finishedProductId: item.finishedProductId,
                quantity: item.quantity,
                price: item.price,
                currency,
                fxRateToUzs:
                  currency === PurchaseOrderCurrency.UZS
                    ? null
                    : (item.fxRateToUzs ?? null),
                total,
              };
            }),
          },
        },
        include: { items: true, client: true, payments: true },
      });

      await this.consumeOrderItemsFromStock(tx, dto.items, id, updatedById);

      const { effectivePaid, debtAmount } =
        await this.kassaService.applySaleBalanceDeduction(tx, {
          clientId: dto.clientId,
          orderId: id,
          totalAmount,
          paidAmount,
          createdById: updatedById,
        });

      const orderWithTotals = await tx.order.update({
        where: { id },
        data: {
          paidAmount: effectivePaid,
          debtAmount,
          status: debtAmount <= 0 ? OrderStatus.COMPLETED : (dto.status ?? OrderStatus.PENDING),
        },
        include: { items: true, client: true, payments: true },
      });

      const payments = await tx.payment.findMany({ where: { orderId: id } });
      const paymentsTotal = payments.reduce((sum, p) => sum + p.amount, 0);

      if (payments.length === 0) {
        if (paidAmount > 0) {
          await tx.payment.create({
            data: {
              clientId: dto.clientId,
              orderId: id,
              amount: paidAmount,
              description: 'Initial order payment',
            },
          });
        }
      } else if (payments.length === 1) {
        await tx.payment.update({
          where: { id: payments[0].id },
          data: { amount: paidAmount, clientId: dto.clientId },
        });
      } else if (Math.abs(paymentsTotal - paidAmount) > 0.01) {
        if (paidAmount < paymentsTotal - payments[0].amount) {
          throw new BadRequestException(
            'Paid amount is less than additional payments already recorded',
          );
        }
        await tx.payment.update({
          where: { id: payments[0].id },
          data: {
            amount: Math.max(0, paidAmount - (paymentsTotal - payments[0].amount)),
            clientId: dto.clientId,
          },
        });
      }

      return orderWithTotals;
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
    if (isClientRemoved(client)) {
      throw new BadRequestException('Client has been removed');
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
      orderBy: { orderedAt: 'desc' },
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
