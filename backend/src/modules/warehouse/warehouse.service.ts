import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  EntityStatus,
  InventoryItemType,
  MovementType,
  Prisma,
  ProductAuditActionType,
} from '../../generated/prisma/client.js';
import { RealtimeGateway } from '../../socket/realtime.gateway.js';
import {
  CreateProductDto,
  ProductRawMaterialInputDto,
} from './dto/create-product.dto.js';
import { InventoryMovementDto } from './dto/inventory-movement.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

const PRODUCT_AUDIT_ACTOR_INCLUDE = {
  actor: {
    select: {
      id: true,
      fullName: true,
      role: true,
    },
  },
} satisfies Prisma.ProductAuditLogInclude;

const SEMI_PRODUCT_INCLUDE = {
  rawMaterials: {
    include: {
      rawMaterial: {
        select: {
          id: true,
          name: true,
          unit: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  },
} satisfies Prisma.SemiProductInclude;

const FINISHED_PRODUCT_INCLUDE = {
  semiProducts: {
    include: {
      semiProduct: {
        select: {
          id: true,
          name: true,
          weightGram: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  },
  machines: {
    include: {
      machine: {
        select: {
          id: true,
          name: true,
          stage: true,
          isActive: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  },
} satisfies Prisma.FinishedProductInclude;

@Injectable()
export class WarehouseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async createProduct(dto: CreateProductDto, userId?: string) {
    switch (dto.itemType) {
      case InventoryItemType.RAW_MATERIAL: {
        const item = await this.prisma.$transaction(async (tx) => {
          const created = await tx.rawMaterial.create({
            data: {
              name: dto.name.trim(),
              unit: dto.unit?.trim() || 'kg',
              description: this.normalizeOptionalString(dto.description),
            },
          });
          await tx.inventoryBalance.create({
            data: {
              itemType: InventoryItemType.RAW_MATERIAL,
              rawMaterialId: created.id,
              quantity: 0,
            },
          });
          await this.createProductAuditLog(
            tx,
            InventoryItemType.RAW_MATERIAL,
            created.id,
            ProductAuditActionType.CREATED,
            userId,
            undefined,
            created,
          );
          return created;
        });
        return item;
      }
      case InventoryItemType.SEMI_PRODUCT: {
        this.assertSemiProductPayload(dto);
        const item = await this.prisma.$transaction(async (tx) => {
          await this.ensureRawMaterialsExist(
            tx,
            dto.rawMaterials!.map((item) => item.rawMaterialId),
          );
          const created = await this.createSemiProductRecord(tx, dto);
          await this.createProductAuditLog(
            tx,
            InventoryItemType.SEMI_PRODUCT,
            created.id,
            ProductAuditActionType.CREATED,
            userId,
            undefined,
            created,
          );
          return created;
        });
        return item;
      }
      case InventoryItemType.FINISHED_PRODUCT: {
        this.assertFinishedProductPayload(dto);
        const item = await this.prisma.$transaction(async (tx) => {
          await this.ensureSemiProductsExist(tx, dto.semiProductIds!);
          await this.ensureMachinesExist(tx, dto.machineIds!);
          const created = await this.createFinishedProductRecord(tx, dto);
          await this.createProductAuditLog(
            tx,
            InventoryItemType.FINISHED_PRODUCT,
            created.id,
            ProductAuditActionType.CREATED,
            userId,
            undefined,
            created,
          );
          return created;
        });
        return item;
      }
      default:
        throw new BadRequestException('Unsupported product type');
    }
  }

  async updateProduct(
    currentItemType: InventoryItemType,
    id: string,
    dto: UpdateProductDto,
    userId?: string,
  ) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('No fields provided for update');
    }

    const targetItemType = dto.itemType ?? currentItemType;

    if (
      currentItemType === InventoryItemType.RAW_MATERIAL &&
      targetItemType !== InventoryItemType.RAW_MATERIAL
    ) {
      throw new BadRequestException(
        'Raw material type cannot be converted to another product type',
      );
    }

    let updatedItem: unknown;
    let resultItemType = targetItemType;

    switch (currentItemType) {
      case InventoryItemType.RAW_MATERIAL: {
        const existing = await this.prisma.rawMaterial.findUnique({
          where: { id },
        });
        if (!existing) {
          throw new NotFoundException('Product not found');
        }
        updatedItem = await this.prisma.$transaction(async (tx) => {
          const updated = await tx.rawMaterial.update({
            where: { id },
            data: {
              name: dto.name?.trim(),
              unit: dto.unit?.trim(),
              description:
                dto.description !== undefined
                  ? this.normalizeOptionalString(dto.description)
                  : undefined,
            },
          });
          await this.createProductAuditLog(
            tx,
            InventoryItemType.RAW_MATERIAL,
            id,
            ProductAuditActionType.UPDATED,
            userId,
            existing,
            updated,
          );
          return updated;
        });
        break;
      }
      case InventoryItemType.SEMI_PRODUCT: {
        if (targetItemType === InventoryItemType.SEMI_PRODUCT) {
          updatedItem = await this.updateSemiProduct(id, dto, userId);
          break;
        }
        updatedItem = await this.changeProductType(
          currentItemType,
          targetItemType,
          id,
          dto,
          userId,
        );
        resultItemType = targetItemType;
        break;
      }
      case InventoryItemType.FINISHED_PRODUCT: {
        if (targetItemType === InventoryItemType.FINISHED_PRODUCT) {
          updatedItem = await this.updateFinishedProduct(id, dto, userId);
          break;
        }
        updatedItem = await this.changeProductType(
          currentItemType,
          targetItemType,
          id,
          dto,
          userId,
        );
        resultItemType = targetItemType;
        break;
      }
      default:
        throw new BadRequestException('Unsupported product type');
    }

    const payload = {
      source: 'warehouse-product',
      action: 'updated',
      itemType: resultItemType,
      previousItemType: currentItemType,
      id:
        typeof updatedItem === 'object' &&
        updatedItem !== null &&
        'id' in updatedItem &&
        typeof updatedItem.id === 'string'
          ? updatedItem.id
          : id,
      item: updatedItem,
    };
    this.realtimeGateway.emitWarehouseUpdated(payload);
    return payload;
  }

  async deleteProduct(itemType: InventoryItemType, id: string, userId?: string) {
    await this.ensureProductCanBeDeleted(itemType, id);

    const deleted = await this.prisma.$transaction(async (tx) => {
      switch (itemType) {
        case InventoryItemType.RAW_MATERIAL: {
          const existing = await tx.rawMaterial.findUnique({ where: { id } });
          if (!existing) {
            throw new NotFoundException('Product not found');
          }
          await tx.inventoryBalance.deleteMany({
            where: { rawMaterialId: id },
          });
          const removed = await tx.rawMaterial.delete({ where: { id } });
          await this.createProductAuditLog(
            tx,
            InventoryItemType.RAW_MATERIAL,
            id,
            ProductAuditActionType.DELETED,
            userId,
            existing,
            undefined,
          );
          return removed;
        }
        case InventoryItemType.SEMI_PRODUCT: {
          const existing = await tx.semiProduct.findFirst({
            where: { id, isDeleted: false },
            include: SEMI_PRODUCT_INCLUDE,
          });
          if (!existing) {
            throw new NotFoundException('Product not found');
          }
          const updated = await tx.semiProduct.update({
            where: { id },
            data: { isDeleted: true },
            include: SEMI_PRODUCT_INCLUDE,
          });
          await this.createProductAuditLog(
            tx,
            InventoryItemType.SEMI_PRODUCT,
            id,
            ProductAuditActionType.DELETED,
            userId,
            existing,
            updated,
          );
          return updated;
        }
        case InventoryItemType.FINISHED_PRODUCT: {
          const existing = await tx.finishedProduct.findFirst({
            where: { id, isDeleted: false },
            include: FINISHED_PRODUCT_INCLUDE,
          });
          if (!existing) {
            throw new NotFoundException('Product not found');
          }
          const updated = await tx.finishedProduct.update({
            where: { id },
            data: { isDeleted: true },
            include: FINISHED_PRODUCT_INCLUDE,
          });
          await this.createProductAuditLog(
            tx,
            InventoryItemType.FINISHED_PRODUCT,
            id,
            ProductAuditActionType.DELETED,
            userId,
            existing,
            updated,
          );
          return updated;
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

    return balances
      .filter((balance) => {
        if (
          balance.itemType === InventoryItemType.SEMI_PRODUCT &&
          balance.semiProduct?.isDeleted
        ) {
          return false;
        }
        if (
          balance.itemType === InventoryItemType.FINISHED_PRODUCT &&
          balance.finishedProduct?.isDeleted
        ) {
          return false;
        }
        return true;
      })
      .map((balance) => ({
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
        where: { isDeleted: false },
        include: SEMI_PRODUCT_INCLUDE,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.finishedProduct.findMany({
        where: { isDeleted: false },
        include: FINISHED_PRODUCT_INCLUDE,
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const auditLogs = await this.prisma.productAuditLog.findMany({
      where: {
        OR: [
          ...(rawMaterials.length > 0
            ? [
                {
                  itemType: InventoryItemType.RAW_MATERIAL,
                  entityId: { in: rawMaterials.map((item) => item.id) },
                },
              ]
            : []),
          ...(semiProducts.length > 0
            ? [
                {
                  itemType: InventoryItemType.SEMI_PRODUCT,
                  entityId: { in: semiProducts.map((item) => item.id) },
                },
              ]
            : []),
          ...(finishedProducts.length > 0
            ? [
                {
                  itemType: InventoryItemType.FINISHED_PRODUCT,
                  entityId: { in: finishedProducts.map((item) => item.id) },
                },
              ]
            : []),
        ],
      },
      include: PRODUCT_AUDIT_ACTOR_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    const auditMap = new Map<string, typeof auditLogs>();
    for (const log of auditLogs) {
      const key = `${log.itemType}:${log.entityId}`;
      const group = auditMap.get(key);
      if (group) {
        group.push(log);
      } else {
        auditMap.set(key, [log]);
      }
    }

    return {
      rawMaterials: rawMaterials.map((item) => ({
        ...item,
        audit: this.buildAuditSummary(
          auditMap.get(`${InventoryItemType.RAW_MATERIAL}:${item.id}`) ?? [],
        ),
      })),
      semiProducts: semiProducts.map((item) => ({
        ...item,
        audit: this.buildAuditSummary(
          auditMap.get(`${InventoryItemType.SEMI_PRODUCT}:${item.id}`) ?? [],
        ),
      })),
      finishedProducts: finishedProducts.map((item) => ({
        ...item,
        audit: this.buildAuditSummary(
          auditMap.get(`${InventoryItemType.FINISHED_PRODUCT}:${item.id}`) ?? [],
        ),
      })),
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

  private async updateSemiProduct(
    id: string,
    dto: UpdateProductDto,
    userId?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.semiProduct.findFirst({
        where: { id, isDeleted: false },
        include: SEMI_PRODUCT_INCLUDE,
      });
      if (!existing) {
        throw new NotFoundException('Product not found');
      }

      const nextRawMaterials = dto.rawMaterials ?? existing.rawMaterials.map((item) => ({
        rawMaterialId: item.rawMaterialId,
        amountGram: item.amountGram,
      }));
      this.assertSemiProductPayload({
        itemType: InventoryItemType.SEMI_PRODUCT,
        name: dto.name?.trim() ?? existing.name,
        description: dto.description ?? existing.description ?? undefined,
        weightGram: dto.weightGram ?? existing.weightGram,
        rawMaterials: nextRawMaterials,
      });
      await this.ensureRawMaterialsExist(
        tx,
        nextRawMaterials.map((item) => item.rawMaterialId),
      );

      await tx.semiProduct.update({
        where: { id },
        data: {
          name: dto.name?.trim(),
          description:
            dto.description !== undefined
              ? this.normalizeOptionalString(dto.description)
              : undefined,
          weightGram: dto.weightGram,
        },
      });

      if (dto.rawMaterials) {
        await tx.semiProductRawMaterial.deleteMany({
          where: { semiProductId: id },
        });
        await tx.semiProductRawMaterial.createMany({
          data: this.normalizeRawMaterials(dto.rawMaterials).map((item) => ({
            semiProductId: id,
            rawMaterialId: item.rawMaterialId,
            amountGram: item.amountGram,
          })),
        });
      }

      const updated = await tx.semiProduct.findFirst({
        where: { id, isDeleted: false },
        include: SEMI_PRODUCT_INCLUDE,
      });
      if (!updated) {
        throw new NotFoundException('Product not found');
      }

      await this.createProductAuditLog(
        tx,
        InventoryItemType.SEMI_PRODUCT,
        id,
        ProductAuditActionType.UPDATED,
        userId,
        existing,
        updated,
      );

      return updated;
    });
  }

  private async updateFinishedProduct(
    id: string,
    dto: UpdateProductDto,
    userId?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.finishedProduct.findFirst({
        where: { id, isDeleted: false },
        include: FINISHED_PRODUCT_INCLUDE,
      });
      if (!existing) {
        throw new NotFoundException('Product not found');
      }

      const nextSemiIds =
        dto.semiProductIds ??
        existing.semiProducts.map((item) => item.semiProductId);
      const nextMachineIds =
        dto.machineIds ?? existing.machines.map((item) => item.machineId);

      this.assertFinishedProductPayload({
        itemType: InventoryItemType.FINISHED_PRODUCT,
        name: dto.name?.trim() ?? existing.name,
        description: dto.description ?? existing.description ?? undefined,
        volumeLiter: dto.volumeLiter ?? existing.volumeLiter,
        semiProductIds: nextSemiIds,
        machineIds: nextMachineIds,
      });
      await this.ensureSemiProductsExist(tx, nextSemiIds);
      await this.ensureMachinesExist(tx, nextMachineIds);

      await tx.finishedProduct.update({
        where: { id },
        data: {
          name: dto.name?.trim(),
          description:
            dto.description !== undefined
              ? this.normalizeOptionalString(dto.description)
              : undefined,
          volumeLiter: dto.volumeLiter,
        },
      });

      if (dto.semiProductIds) {
        await tx.finishedProductSemiProduct.deleteMany({
          where: { finishedProductId: id },
        });
        await tx.finishedProductSemiProduct.createMany({
          data: this.normalizeIdList(dto.semiProductIds).map((semiProductId) => ({
            finishedProductId: id,
            semiProductId,
          })),
        });
      }

      if (dto.machineIds) {
        await tx.finishedProductMachine.deleteMany({
          where: { finishedProductId: id },
        });
        await tx.finishedProductMachine.createMany({
          data: this.normalizeIdList(dto.machineIds).map((machineId) => ({
            finishedProductId: id,
            machineId,
          })),
        });
      }

      const updated = await tx.finishedProduct.findFirst({
        where: { id, isDeleted: false },
        include: FINISHED_PRODUCT_INCLUDE,
      });
      if (!updated) {
        throw new NotFoundException('Product not found');
      }

      await this.createProductAuditLog(
        tx,
        InventoryItemType.FINISHED_PRODUCT,
        id,
        ProductAuditActionType.UPDATED,
        userId,
        existing,
        updated,
      );

      return updated;
    });
  }

  private async changeProductType(
    currentItemType: InventoryItemType,
    targetItemType: InventoryItemType,
    id: string,
    dto: UpdateProductDto,
    userId?: string,
  ) {
    if (
      ![InventoryItemType.SEMI_PRODUCT, InventoryItemType.FINISHED_PRODUCT].includes(
        targetItemType,
      )
    ) {
      throw new BadRequestException('Unsupported product type');
    }

    return this.prisma.$transaction(async (tx) => {
      await this.ensureProductCanBeDeletedTx(tx, currentItemType, id);

      if (
        currentItemType === InventoryItemType.SEMI_PRODUCT &&
        targetItemType === InventoryItemType.FINISHED_PRODUCT
      ) {
        const existing = await tx.semiProduct.findFirst({
          where: { id, isDeleted: false },
          include: SEMI_PRODUCT_INCLUDE,
        });
        if (!existing) {
          throw new NotFoundException('Product not found');
        }

        this.assertFinishedProductPayload({
          itemType: InventoryItemType.FINISHED_PRODUCT,
          name: dto.name?.trim() ?? existing.name,
          description: dto.description ?? existing.description ?? undefined,
          volumeLiter: dto.volumeLiter,
          semiProductIds: dto.semiProductIds,
          machineIds: dto.machineIds,
        });
        await this.ensureSemiProductsExist(tx, dto.semiProductIds!);
        await this.ensureMachinesExist(tx, dto.machineIds!);

        await tx.inventoryBalance.deleteMany({ where: { semiProductId: id } });
        await tx.semiProduct.delete({ where: { id } });

        const created = await this.createFinishedProductRecord(tx, {
          itemType: InventoryItemType.FINISHED_PRODUCT,
          name: dto.name?.trim() ?? existing.name,
          description: dto.description ?? existing.description ?? undefined,
          volumeLiter: dto.volumeLiter,
          semiProductIds: dto.semiProductIds,
          machineIds: dto.machineIds,
        });

        await this.createProductAuditLog(
          tx,
          InventoryItemType.SEMI_PRODUCT,
          id,
          ProductAuditActionType.DELETED,
          userId,
          existing,
          undefined,
          {
            reason: 'type_changed',
            targetItemType,
          },
        );
        await this.createProductAuditLog(
          tx,
          InventoryItemType.FINISHED_PRODUCT,
          created.id,
          ProductAuditActionType.CREATED,
          userId,
          undefined,
          created,
          {
            source: 'type_changed',
            previousItemType: currentItemType,
            previousEntityId: id,
          },
        );

        return created;
      }

      if (
        currentItemType === InventoryItemType.FINISHED_PRODUCT &&
        targetItemType === InventoryItemType.SEMI_PRODUCT
      ) {
        const existing = await tx.finishedProduct.findFirst({
          where: { id, isDeleted: false },
          include: FINISHED_PRODUCT_INCLUDE,
        });
        if (!existing) {
          throw new NotFoundException('Product not found');
        }

        this.assertSemiProductPayload({
          itemType: InventoryItemType.SEMI_PRODUCT,
          name: dto.name?.trim() ?? existing.name,
          description: dto.description ?? existing.description ?? undefined,
          weightGram: dto.weightGram,
          rawMaterials: dto.rawMaterials,
        });
        await this.ensureRawMaterialsExist(
          tx,
          dto.rawMaterials!.map((item) => item.rawMaterialId),
        );

        await tx.inventoryBalance.deleteMany({ where: { finishedProductId: id } });
        await tx.finishedProduct.delete({ where: { id } });

        const created = await this.createSemiProductRecord(tx, {
          itemType: InventoryItemType.SEMI_PRODUCT,
          name: dto.name?.trim() ?? existing.name,
          description: dto.description ?? existing.description ?? undefined,
          weightGram: dto.weightGram,
          rawMaterials: dto.rawMaterials,
        });

        await this.createProductAuditLog(
          tx,
          InventoryItemType.FINISHED_PRODUCT,
          id,
          ProductAuditActionType.DELETED,
          userId,
          existing,
          undefined,
          {
            reason: 'type_changed',
            targetItemType,
          },
        );
        await this.createProductAuditLog(
          tx,
          InventoryItemType.SEMI_PRODUCT,
          created.id,
          ProductAuditActionType.CREATED,
          userId,
          undefined,
          created,
          {
            source: 'type_changed',
            previousItemType: currentItemType,
            previousEntityId: id,
          },
        );

        return created;
      }

      throw new BadRequestException('Unsupported product type');
    });
  }

  private async createSemiProductRecord(
    tx: Prisma.TransactionClient,
    dto: Pick<
      CreateProductDto,
      'name' | 'description' | 'weightGram' | 'rawMaterials'
    >,
  ) {
    const rawMaterials = this.normalizeRawMaterials(dto.rawMaterials ?? []);
    const created = await tx.semiProduct.create({
      data: {
        name: dto.name.trim(),
        description: this.normalizeOptionalString(dto.description),
        weightGram: dto.weightGram ?? 0,
      },
    });
    await tx.inventoryBalance.create({
      data: {
        itemType: InventoryItemType.SEMI_PRODUCT,
        semiProductId: created.id,
        quantity: 0,
      },
    });
    await tx.semiProductRawMaterial.createMany({
      data: rawMaterials.map((item) => ({
        semiProductId: created.id,
        rawMaterialId: item.rawMaterialId,
        amountGram: item.amountGram,
      })),
    });

    const result = await tx.semiProduct.findUnique({
      where: { id: created.id },
      include: SEMI_PRODUCT_INCLUDE,
    });
    if (!result) {
      throw new NotFoundException('Product not found');
    }
    return result;
  }

  private async createFinishedProductRecord(
    tx: Prisma.TransactionClient,
    dto: Pick<
      CreateProductDto,
      'name' | 'description' | 'volumeLiter' | 'semiProductIds' | 'machineIds'
    >,
  ) {
    const semiProductIds = this.normalizeIdList(dto.semiProductIds ?? []);
    const machineIds = this.normalizeIdList(dto.machineIds ?? []);
    const created = await tx.finishedProduct.create({
      data: {
        name: dto.name.trim(),
        description: this.normalizeOptionalString(dto.description),
        volumeLiter: dto.volumeLiter ?? 0,
      },
    });
    await tx.inventoryBalance.create({
      data: {
        itemType: InventoryItemType.FINISHED_PRODUCT,
        finishedProductId: created.id,
        quantity: 0,
      },
    });
    await tx.finishedProductSemiProduct.createMany({
      data: semiProductIds.map((semiProductId) => ({
        finishedProductId: created.id,
        semiProductId,
      })),
    });
    await tx.finishedProductMachine.createMany({
      data: machineIds.map((machineId) => ({
        finishedProductId: created.id,
        machineId,
      })),
    });

    const result = await tx.finishedProduct.findUnique({
      where: { id: created.id },
      include: FINISHED_PRODUCT_INCLUDE,
    });
    if (!result) {
      throw new NotFoundException('Product not found');
    }
    return result;
  }

  private assertSemiProductPayload(
    dto: Pick<
      CreateProductDto,
      'name' | 'weightGram' | 'rawMaterials'
    >,
  ) {
    if (!dto.name?.trim()) {
      throw new BadRequestException('Product name is required');
    }
    if (!Number.isFinite(dto.weightGram) || (dto.weightGram ?? 0) <= 0) {
      throw new BadRequestException(
        'Semi-finished product weight must be greater than zero',
      );
    }
    const rawMaterials = this.normalizeRawMaterials(dto.rawMaterials ?? []);
    if (rawMaterials.length === 0) {
      throw new BadRequestException(
        'At least one raw material is required for semi-finished products',
      );
    }
  }

  private assertFinishedProductPayload(
    dto: Pick<
      CreateProductDto,
      'name' | 'volumeLiter' | 'semiProductIds' | 'machineIds'
    >,
  ) {
    if (!dto.name?.trim()) {
      throw new BadRequestException('Product name is required');
    }
    if (!Number.isFinite(dto.volumeLiter) || (dto.volumeLiter ?? 0) <= 0) {
      throw new BadRequestException(
        'Finished product volume must be greater than zero',
      );
    }
    if (this.normalizeIdList(dto.semiProductIds ?? []).length === 0) {
      throw new BadRequestException(
        'At least one semi-finished product is required for finished products',
      );
    }
    if (this.normalizeIdList(dto.machineIds ?? []).length === 0) {
      throw new BadRequestException(
        'At least one machine is required for finished products',
      );
    }
  }

  private normalizeRawMaterials(
    rawMaterials: ProductRawMaterialInputDto[],
  ): ProductRawMaterialInputDto[] {
    const normalized = rawMaterials.map((item) => ({
      rawMaterialId: item.rawMaterialId.trim(),
      amountGram: Number(item.amountGram),
    }));
    const seen = new Set<string>();
    for (const item of normalized) {
      if (!item.rawMaterialId) {
        throw new BadRequestException('Raw material is required');
      }
      if (!Number.isFinite(item.amountGram) || item.amountGram <= 0) {
        throw new BadRequestException('Raw material amount must be greater than zero');
      }
      if (seen.has(item.rawMaterialId)) {
        throw new BadRequestException('Raw materials must be unique');
      }
      seen.add(item.rawMaterialId);
    }
    return normalized;
  }

  private normalizeIdList(values: string[]): string[] {
    const normalized = values.map((value) => value.trim()).filter(Boolean);
    const unique = Array.from(new Set(normalized));
    if (unique.length !== normalized.length) {
      throw new BadRequestException('Duplicate values are not allowed');
    }
    return unique;
  }

  private normalizeOptionalString(value?: string | null) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }

  private async ensureRawMaterialsExist(
    tx: Prisma.TransactionClient,
    ids: string[],
  ) {
    const normalized = this.normalizeIdList(ids);
    const count = await tx.rawMaterial.count({
      where: { id: { in: normalized } },
    });
    if (count !== normalized.length) {
      throw new BadRequestException('One or more raw materials were not found');
    }
  }

  private async ensureSemiProductsExist(
    tx: Prisma.TransactionClient,
    ids: string[],
  ) {
    const normalized = this.normalizeIdList(ids);
    const count = await tx.semiProduct.count({
      where: {
        id: { in: normalized },
        isDeleted: false,
      },
    });
    if (count !== normalized.length) {
      throw new BadRequestException(
        'One or more semi-finished products were not found',
      );
    }
  }

  private async ensureMachinesExist(
    tx: Prisma.TransactionClient,
    ids: string[],
  ) {
    const normalized = this.normalizeIdList(ids);
    const count = await tx.machine.count({
      where: { id: { in: normalized } },
    });
    if (count !== normalized.length) {
      throw new BadRequestException('One or more machines were not found');
    }
  }

  private buildAuditSummary(
    logs: Array<
      Prisma.ProductAuditLogGetPayload<{
        include: typeof PRODUCT_AUDIT_ACTOR_INCLUDE;
      }>
    >,
  ) {
    const created = logs.find((item) => item.actionType === ProductAuditActionType.CREATED);
    const updated = logs.find((item) => item.actionType === ProductAuditActionType.UPDATED);
    const deleted = logs.find((item) => item.actionType === ProductAuditActionType.DELETED);

    return {
      createdAt: created?.createdAt,
      createdBy: created?.actor ?? null,
      updatedAt: updated?.createdAt ?? null,
      updatedBy: updated?.actor ?? null,
      deletedAt: deleted?.createdAt ?? null,
      deletedBy: deleted?.actor ?? null,
    };
  }

  private async createProductAuditLog(
    tx: Prisma.TransactionClient,
    itemType: InventoryItemType,
    entityId: string,
    actionType: ProductAuditActionType,
    actorId?: string,
    oldData?: unknown,
    newData?: unknown,
    metadata?: unknown,
  ) {
    await tx.productAuditLog.create({
      data: {
        itemType,
        entityId,
        actionType,
        actorId,
        oldData: this.toJsonValue(oldData),
        newData: this.toJsonValue(newData),
        metadata: this.toJsonValue(metadata),
      },
    });
  }

  private toJsonValue(value: unknown): Prisma.InputJsonValue | undefined {
    if (value === undefined) {
      return undefined;
    }
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }

  private async ensureProductCanBeDeleted(
    itemType: InventoryItemType,
    id: string,
  ) {
    await this.ensureProductCanBeDeletedTx(this.prisma, itemType, id);
  }

  private async ensureProductCanBeDeletedTx(
    tx: Prisma.TransactionClient | PrismaService,
    itemType: InventoryItemType,
    id: string,
  ) {
    switch (itemType) {
      case InventoryItemType.RAW_MATERIAL: {
        const [
          item,
          balance,
          movementCount,
          consumptionCount,
          bagCount,
          componentCount,
        ] =
          await Promise.all([
            tx.rawMaterial.findUnique({ where: { id } }),
            tx.inventoryBalance.findFirst({
              where: { rawMaterialId: id },
            }),
            tx.inventoryMovement.count({
              where: { rawMaterialId: id },
            }),
            tx.productionConsumption.count({
              where: { rawMaterialId: id },
            }),
            tx.rawMaterialBag.count({
              where: { rawMaterialId: id },
            }),
            tx.semiProductRawMaterial.count({
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
          bagCount > 0 ||
          componentCount > 0
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
          componentCount,
        ] = await Promise.all([
          tx.semiProduct.findFirst({ where: { id, isDeleted: false } }),
          tx.inventoryBalance.findFirst({
            where: { semiProductId: id },
          }),
          tx.inventoryMovement.count({
            where: { semiProductId: id },
          }),
          tx.productionConsumption.count({
            where: { semiProductId: id },
          }),
          tx.productionRecord.count({
            where: { outputSemiProductId: id },
          }),
          tx.orderItem.count({
            where: { semiProductId: id },
          }),
          tx.finishedProductSemiProduct.count({
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
          orderCount > 0 ||
          componentCount > 0
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
            tx.finishedProduct.findFirst({ where: { id, isDeleted: false } }),
            tx.inventoryBalance.findFirst({
              where: { finishedProductId: id },
            }),
            tx.inventoryMovement.count({
              where: { finishedProductId: id },
            }),
            tx.productionRecord.count({
              where: { outputFinishedProductId: id },
            }),
            tx.orderItem.count({
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
