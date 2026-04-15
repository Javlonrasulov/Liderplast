import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  EntityStatus,
  Prisma,
  InventoryItemType,
  MovementType,
} from '../../generated/prisma/client.js';
import { RealtimeGateway } from '../../socket/realtime.gateway.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { InventoryMovementDto } from './dto/inventory-movement.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

@Injectable()
export class WarehouseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async createProduct(dto: CreateProductDto) {
    switch (dto.itemType) {
      case InventoryItemType.RAW_MATERIAL: {
        const item = await this.prisma.rawMaterial.create({
          data: {
            name: dto.name,
            unit: dto.unit ?? 'kg',
            description: dto.description,
          },
        });
        await this.prisma.inventoryBalance.create({
          data: {
            itemType: InventoryItemType.RAW_MATERIAL,
            rawMaterialId: item.id,
            quantity: 0,
          },
        });
        return item;
      }
      case InventoryItemType.SEMI_PRODUCT: {
        const item = await this.prisma.semiProduct.create({
          data: {
            name: dto.name,
            description: dto.description,
            weightGram: dto.weightGram ?? 0,
          },
        });
        await this.prisma.inventoryBalance.create({
          data: {
            itemType: InventoryItemType.SEMI_PRODUCT,
            semiProductId: item.id,
            quantity: 0,
          },
        });
        return item;
      }
      case InventoryItemType.FINISHED_PRODUCT: {
        const item = await this.prisma.finishedProduct.create({
          data: {
            name: dto.name,
            description: dto.description,
            volumeLiter: dto.volumeLiter ?? 0,
          },
        });
        await this.prisma.inventoryBalance.create({
          data: {
            itemType: InventoryItemType.FINISHED_PRODUCT,
            finishedProductId: item.id,
            quantity: 0,
          },
        });
        return item;
      }
      default:
        throw new BadRequestException('Unsupported product type');
    }
  }

  async updateProduct(
    itemType: InventoryItemType,
    id: string,
    dto: UpdateProductDto,
  ) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('No fields provided for update');
    }

    let updatedItem: unknown;

    switch (itemType) {
      case InventoryItemType.RAW_MATERIAL:
        updatedItem = await this.prisma.rawMaterial.update({
          where: { id },
          data: {
            name: dto.name,
            unit: dto.unit,
            description: dto.description,
          },
        });
        break;
      case InventoryItemType.SEMI_PRODUCT:
        updatedItem = await this.prisma.semiProduct.update({
          where: { id },
          data: {
            name: dto.name,
            description: dto.description,
            weightGram: dto.weightGram,
          },
        });
        break;
      case InventoryItemType.FINISHED_PRODUCT:
        updatedItem = await this.prisma.finishedProduct.update({
          where: { id },
          data: {
            name: dto.name,
            description: dto.description,
            volumeLiter: dto.volumeLiter,
          },
        });
        break;
      default:
        throw new BadRequestException('Unsupported product type');
    }

    const payload = {
      source: 'warehouse-product',
      action: 'updated',
      itemType,
      id,
      item: updatedItem,
    };
    this.realtimeGateway.emitWarehouseUpdated(payload);
    return payload;
  }

  async deleteProduct(itemType: InventoryItemType, id: string) {
    await this.ensureProductCanBeDeleted(itemType, id);

    const deleted = await this.prisma.$transaction(async (tx) => {
      switch (itemType) {
        case InventoryItemType.RAW_MATERIAL: {
          await tx.inventoryBalance.deleteMany({
            where: { rawMaterialId: id },
          });
          return tx.rawMaterial.delete({ where: { id } });
        }
        case InventoryItemType.SEMI_PRODUCT: {
          await tx.inventoryBalance.deleteMany({
            where: { semiProductId: id },
          });
          return tx.semiProduct.delete({ where: { id } });
        }
        case InventoryItemType.FINISHED_PRODUCT: {
          await tx.inventoryBalance.deleteMany({
            where: { finishedProductId: id },
          });
          return tx.finishedProduct.delete({ where: { id } });
        }
        default:
          throw new BadRequestException('Unsupported product type');
      }
    });

    const payload = {
      source: 'warehouse-product',
      action: 'deleted',
      itemType,
      id,
      item: deleted,
    };
    this.realtimeGateway.emitWarehouseUpdated(payload);
    return payload;
  }

  async getStockSummary() {
    const balances = await this.prisma.inventoryBalance.findMany({
      include: {
        rawMaterial: true,
        semiProduct: true,
        finishedProduct: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return balances.map((balance) => ({
      id: balance.id,
      itemType: balance.itemType,
      quantity: balance.quantity,
      status: balance.status,
      itemName:
        balance.rawMaterial?.name ??
        balance.semiProduct?.name ??
        balance.finishedProduct?.name,
    }));
  }

  async getHistory() {
    return this.prisma.inventoryMovement.findMany({
      include: {
        rawMaterial: true,
        semiProduct: true,
        finishedProduct: true,
        createdBy: {
          omit: { passwordHash: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCatalog() {
    const [rawMaterials, semiProducts, finishedProducts] = await Promise.all([
      this.prisma.rawMaterial.findMany({
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.semiProduct.findMany({
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.finishedProduct.findMany({
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    return {
      rawMaterials,
      semiProducts,
      finishedProducts,
    };
  }

  async createMovement(dto: InventoryMovementDto, createdById?: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const balance = await this.getBalanceRecord(tx, dto);
      if (!balance) {
        throw new NotFoundException('Inventory balance not found');
      }

      const previousQuantity = balance.quantity;
      const delta =
        dto.movementType === MovementType.INCOMING ||
        dto.movementType === MovementType.PRODUCTION_OUTPUT
          ? dto.quantity
          : -dto.quantity;
      const nextQuantity = previousQuantity + delta;

      if (nextQuantity < 0) {
        throw new BadRequestException('Stock cannot go negative');
      }

      const updatedBalance = await tx.inventoryBalance.update({
        where: { id: balance.id },
        data: {
          quantity: nextQuantity,
          status: EntityStatus.COMPLETED,
        },
      });

      const movement = await tx.inventoryMovement.create({
        data: {
          itemType: dto.itemType,
          movementType: dto.movementType,
          quantity: dto.quantity,
          previousQuantity,
          newQuantity: nextQuantity,
          note: dto.note,
          createdById,
          rawMaterialId: dto.rawMaterialId,
          semiProductId: dto.semiProductId,
          finishedProductId: dto.finishedProductId,
          status: EntityStatus.COMPLETED,
        },
      });

      return { movement, updatedBalance };
    });

    this.realtimeGateway.emitWarehouseUpdated(result);
    return result;
  }

  private getBalanceRecord(
    tx: Prisma.TransactionClient,
    dto: InventoryMovementDto,
  ) {
    if (dto.itemType === InventoryItemType.RAW_MATERIAL) {
      return tx.inventoryBalance.findFirst({
        where: { rawMaterialId: dto.rawMaterialId },
      });
    }

    if (dto.itemType === InventoryItemType.SEMI_PRODUCT) {
      return tx.inventoryBalance.findFirst({
        where: { semiProductId: dto.semiProductId },
      });
    }

    return tx.inventoryBalance.findFirst({
      where: { finishedProductId: dto.finishedProductId },
    });
  }

  private async ensureProductCanBeDeleted(
    itemType: InventoryItemType,
    id: string,
  ) {
    switch (itemType) {
      case InventoryItemType.RAW_MATERIAL: {
        const [item, balance, movementCount, consumptionCount, bagCount] =
          await Promise.all([
            this.prisma.rawMaterial.findUnique({ where: { id } }),
            this.prisma.inventoryBalance.findFirst({
              where: { rawMaterialId: id },
            }),
            this.prisma.inventoryMovement.count({
              where: { rawMaterialId: id },
            }),
            this.prisma.productionConsumption.count({
              where: { rawMaterialId: id },
            }),
            this.prisma.rawMaterialBag.count({
              where: { rawMaterialId: id },
            }),
          ]);

        if (!item) {
          throw new NotFoundException('Product not found');
        }

        if (
          (balance?.quantity ?? 0) > 0 ||
          movementCount > 0 ||
          consumptionCount > 0 ||
          bagCount > 0
        ) {
          throw new BadRequestException(
            'This product is already used and cannot be deleted',
          );
        }
        return;
      }
      case InventoryItemType.SEMI_PRODUCT: {
        const [
          item,
          balance,
          movementCount,
          consumptionCount,
          outputCount,
          orderCount,
        ] = await Promise.all([
          this.prisma.semiProduct.findUnique({ where: { id } }),
          this.prisma.inventoryBalance.findFirst({
            where: { semiProductId: id },
          }),
          this.prisma.inventoryMovement.count({
            where: { semiProductId: id },
          }),
          this.prisma.productionConsumption.count({
            where: { semiProductId: id },
          }),
          this.prisma.productionRecord.count({
            where: { outputSemiProductId: id },
          }),
          this.prisma.orderItem.count({
            where: { semiProductId: id },
          }),
        ]);

        if (!item) {
          throw new NotFoundException('Product not found');
        }

        if (
          (balance?.quantity ?? 0) > 0 ||
          movementCount > 0 ||
          consumptionCount > 0 ||
          outputCount > 0 ||
          orderCount > 0
        ) {
          throw new BadRequestException(
            'This product is already used and cannot be deleted',
          );
        }
        return;
      }
      case InventoryItemType.FINISHED_PRODUCT: {
        const [item, balance, movementCount, outputCount, orderCount] =
          await Promise.all([
            this.prisma.finishedProduct.findUnique({ where: { id } }),
            this.prisma.inventoryBalance.findFirst({
              where: { finishedProductId: id },
            }),
            this.prisma.inventoryMovement.count({
              where: { finishedProductId: id },
            }),
            this.prisma.productionRecord.count({
              where: { outputFinishedProductId: id },
            }),
            this.prisma.orderItem.count({
              where: { finishedProductId: id },
            }),
          ]);

        if (!item) {
          throw new NotFoundException('Product not found');
        }

        if (
          (balance?.quantity ?? 0) > 0 ||
          movementCount > 0 ||
          outputCount > 0 ||
          orderCount > 0
        ) {
          throw new BadRequestException(
            'This product is already used and cannot be deleted',
          );
        }
        return;
      }
      default:
        throw new BadRequestException('Unsupported product type');
    }
  }
}
