import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EntityStatus,
  InventoryItemType,
  MovementType,
  Prisma,
  ProductAuditActionType,
  ProductAuditEntityType,
  RawMaterialKind,
} from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { RealtimeGateway } from '../../socket/realtime.gateway.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { InventoryMovementDto } from './dto/inventory-movement.dto.js';
import {
  ProductRelationsDto,
  SemiProductRawMaterialInputDto,
} from './dto/product-relations.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { RawMaterialBagsService } from '../raw-material-bags/raw-material-bags.service.js';

type Tx = Prisma.TransactionClient;

type ProductAuditSummary = {
  createdAt?: string;
  createdById?: string;
  createdByName?: string;
  updatedAt?: string;
  updatedById?: string;
  updatedByName?: string;
  deletedAt?: string;
  deletedById?: string;
  deletedByName?: string;
};

type ProductSnapshot = {
  id: string;
  itemType: InventoryItemType;
  name: string;
  description?: string;
  unit?: string;
  rawMaterialKind?: RawMaterialKind;
  defaultBagWeightKg?: number;
  weightGram?: number;
  volumeLiter?: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  rawMaterials?: Array<{
    id: string;
    rawMaterialId: string;
    name: string;
    unit: string;
    amountGram: number;
  }>;
  semiProducts?: Array<{
    id: string;
    semiProductId: string;
    name: string;
    weightGram: number;
  }>;
  machines?: Array<{
    id: string;
    machineId: string;
    name: string;
    stage: string;
    isActive: boolean;
  }>;
  audit: ProductAuditSummary;
};

type ResolvedProductInput = {
  itemType: InventoryItemType;
  name: string;
  description?: string;
  unit?: string;
  rawMaterialKind?: RawMaterialKind;
  defaultBagWeightKg?: number;
  weightGram?: number;
  volumeLiter?: number;
  relations: {
    rawMaterials?: SemiProductRawMaterialInputDto[];
    semiProductIds?: string[];
    machineIds?: string[];
  };
};

@Injectable()
export class WarehouseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly rawMaterialBagsService: RawMaterialBagsService,
  ) {}

  async createProduct(dto: CreateProductDto, createdById?: string) {
    const input = this.resolveCreateInput(dto);

    const payload = await this.prisma.$transaction(async (tx) => {
      await this.assertRelationsExist(
        tx,
        input.itemType,
        input.relations,
        undefined,
        input.itemType,
      );

      await this.createProductRecord(tx, input);
      await this.ensureBalanceRecord(tx, input.itemType, dto.name, 0);

      const created = await this.getProductOrThrow(tx, input.itemType, dto.name);
      await this.createProductAuditLog(
        tx,
        input.itemType,
        created.id,
        createdById,
        undefined,
        created,
        ProductAuditActionType.CREATED,
      );

      return {
        source: 'warehouse-product',
        action: 'created',
        itemType: input.itemType,
        id: created.id,
        item: created,
      };
    });

    this.realtimeGateway.emitWarehouseUpdated(payload);
    return payload;
  }

  async updateProduct(
    itemType: InventoryItemType,
    id: string,
    dto: UpdateProductDto,
    updatedById?: string,
  ) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('No fields provided for update');
    }

    const payload = await this.prisma.$transaction(async (tx) => {
      const current = await this.getProductByIdOrThrow(tx, itemType, id);
      const before = current;
      const input = this.resolveUpdateInput(current, dto);

      await this.assertRelationsExist(
        tx,
        input.itemType,
        input.relations,
        id,
        itemType,
      );

      if (input.itemType !== itemType) {
        await this.ensureProductCanBeDeletedTx(tx, itemType, id);
        await this.migrateProductType(tx, itemType, id, input);
      } else {
        await this.updateProductRecord(tx, itemType, id, input);
      }

      const after = await this.getProductByIdOrThrow(tx, input.itemType, id);
      await this.createProductAuditLog(
        tx,
        input.itemType,
        id,
        updatedById,
        before,
        after,
      );

      return {
        source: 'warehouse-product',
        action: 'updated',
        itemType: input.itemType,
        id,
        item: after,
      };
    });

    this.realtimeGateway.emitWarehouseUpdated(payload);
    return payload;
  }

  async deleteProduct(
    itemType: InventoryItemType,
    id: string,
    deletedById?: string,
  ) {
    const payload = await this.prisma.$transaction(async (tx) => {
      await this.ensureProductCanBeDeletedTx(tx, itemType, id);
      const before = await this.getProductByIdOrThrow(tx, itemType, id);

      switch (itemType) {
        case InventoryItemType.RAW_MATERIAL:
          await tx.rawMaterial.update({
            where: { id },
            data: { isDeleted: true },
          });
          break;
        case InventoryItemType.SEMI_PRODUCT:
          await tx.semiProduct.update({
            where: { id },
            data: { isDeleted: true },
          });
          break;
        case InventoryItemType.FINISHED_PRODUCT:
          await tx.finishedProduct.update({
            where: { id },
            data: { isDeleted: true },
          });
          break;
        default:
          throw new BadRequestException('Unsupported product type');
      }

      await this.createProductAuditLog(
        tx,
        itemType,
        id,
        deletedById,
        before,
        { ...before, isDeleted: true },
        ProductAuditActionType.DELETED,
      );

      return {
        source: 'warehouse-product',
        action: 'deleted',
        itemType,
        id,
        item: { ...before, isDeleted: true },
      };
    });

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
        if (balance.itemType === InventoryItemType.RAW_MATERIAL) {
          return !balance.rawMaterial?.isDeleted;
        }
        if (balance.itemType === InventoryItemType.SEMI_PRODUCT) {
          return !balance.semiProduct?.isDeleted;
        }
        return !balance.finishedProduct?.isDeleted;
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
        where: { isDeleted: false },
        include: {
          productAuditLogs: {
            include: {
              actor: { select: { id: true, fullName: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.semiProduct.findMany({
        where: { isDeleted: false },
        include: {
          rawMaterialLinks: {
            include: {
              rawMaterial: true,
            },
            orderBy: { createdAt: 'asc' },
          },
          productAuditLogs: {
            include: {
              actor: { select: { id: true, fullName: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.finishedProduct.findMany({
        where: { isDeleted: false },
        include: {
          semiProductLinks: {
            include: {
              semiProduct: true,
            },
            orderBy: { createdAt: 'asc' },
          },
          machineLinks: {
            include: {
              machine: true,
            },
            orderBy: { createdAt: 'asc' },
          },
          productAuditLogs: {
            include: {
              actor: { select: { id: true, fullName: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    return {
      rawMaterials: rawMaterials.map((item) => this.serializeRawMaterial(item)),
      semiProducts: semiProducts.map((item) => this.serializeSemiProduct(item)),
      finishedProducts: finishedProducts.map((item) =>
        this.serializeFinishedProduct(item),
      ),
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

      if (
        dto.itemType === InventoryItemType.RAW_MATERIAL &&
        dto.movementType === MovementType.INCOMING &&
        dto.rawMaterialId
      ) {
        await this.rawMaterialBagsService.createAutoBagsForIncomingTx(tx, {
          rawMaterialId: dto.rawMaterialId,
          totalQuantityKg: dto.quantity,
          createdById,
          referenceType: 'warehouse-incoming',
          referenceId: movement.id,
        });
      }

      return { movement, updatedBalance };
    });

    this.realtimeGateway.emitWarehouseUpdated(result);
    return result;
  }

  private resolveCreateInput(dto: CreateProductDto): ResolvedProductInput {
    const input: ResolvedProductInput = {
      itemType: dto.itemType,
      name: dto.name.trim(),
      description: dto.description?.trim() || undefined,
      unit: dto.unit?.trim() || undefined,
      rawMaterialKind:
        dto.itemType === InventoryItemType.RAW_MATERIAL
          ? (dto.rawMaterialKind ?? RawMaterialKind.SIRO)
          : undefined,
      defaultBagWeightKg: dto.defaultBagWeightKg,
      weightGram: dto.weightGram,
      volumeLiter: dto.volumeLiter,
      relations: this.normalizeRelations(dto.relations),
    };

    this.assertTypeSpecificPayload(input.itemType, input);
    return input;
  }

  private resolveUpdateInput(
    current: ProductSnapshot,
    dto: UpdateProductDto,
  ): ResolvedProductInput {
    const nextType = dto.itemType ?? current.itemType;
    const nextRelations = this.normalizeRelations(dto.relations);

    const input: ResolvedProductInput = {
      itemType: nextType,
      name: dto.name?.trim() || current.name,
      description:
        dto.description !== undefined
          ? dto.description.trim() || undefined
          : current.description,
      unit:
        dto.unit !== undefined ? dto.unit.trim() || undefined : current.unit,
      rawMaterialKind:
        nextType === InventoryItemType.RAW_MATERIAL
          ? dto.rawMaterialKind !== undefined
            ? dto.rawMaterialKind
            : current.rawMaterialKind ?? RawMaterialKind.SIRO
          : undefined,
      defaultBagWeightKg:
        dto.defaultBagWeightKg !== undefined
          ? dto.defaultBagWeightKg
          : current.defaultBagWeightKg,
      weightGram:
        dto.weightGram !== undefined ? dto.weightGram : current.weightGram,
      volumeLiter:
        dto.volumeLiter !== undefined ? dto.volumeLiter : current.volumeLiter,
      relations: {
        rawMaterials:
          nextRelations.rawMaterials ??
          current.rawMaterials?.map((item) => ({
            rawMaterialId: item.rawMaterialId,
            amountGram: item.amountGram,
          })),
        semiProductIds:
          nextRelations.semiProductIds ??
          current.semiProducts?.map((item) => item.semiProductId),
        machineIds:
          nextRelations.machineIds ??
          current.machines?.map((item) => item.machineId),
      },
    };

    this.assertTypeSpecificPayload(nextType, input);
    return input;
  }

  private normalizeRelations(
    relations?: ProductRelationsDto,
  ): ResolvedProductInput['relations'] {
    return {
      rawMaterials: relations?.rawMaterials
        ?.map((item) => ({
          rawMaterialId: item.rawMaterialId.trim(),
          amountGram: item.amountGram,
        }))
        .filter((item) => item.rawMaterialId),
      semiProductIds: this.uniqueIds(relations?.semiProductIds),
      machineIds: this.uniqueIds(relations?.machineIds),
    };
  }

  private uniqueIds(ids?: string[]) {
    return [...new Set((ids ?? []).map((id) => id.trim()).filter(Boolean))];
  }

  private assertTypeSpecificPayload(
    itemType: InventoryItemType,
    input: ResolvedProductInput,
  ) {
    if (!input.name) {
      throw new BadRequestException('Product name is required');
    }

    switch (itemType) {
      case InventoryItemType.RAW_MATERIAL:
        return;
      case InventoryItemType.SEMI_PRODUCT:
        if (!input.weightGram || input.weightGram <= 0) {
          throw new BadRequestException(
            'Semi product weightGram must be greater than zero',
          );
        }
        if (!input.relations.rawMaterials?.length) {
          throw new BadRequestException(
            'Semi product requires at least one raw material',
          );
        }
        return;
      case InventoryItemType.FINISHED_PRODUCT:
        if (!input.volumeLiter || input.volumeLiter <= 0) {
          throw new BadRequestException(
            'Finished product volumeLiter must be greater than zero',
          );
        }
        if (!input.relations.semiProductIds?.length) {
          throw new BadRequestException(
            'Finished product requires at least one semi product',
          );
        }
        if (!input.relations.machineIds?.length) {
          throw new BadRequestException(
            'Finished product requires at least one machine',
          );
        }
        return;
      default:
        throw new BadRequestException('Unsupported product type');
    }
  }

  private async assertRelationsExist(
    tx: Tx,
    itemType: InventoryItemType,
    relations: ResolvedProductInput['relations'],
    currentId?: string,
    currentType?: InventoryItemType,
  ) {
    if (itemType === InventoryItemType.SEMI_PRODUCT) {
      const rawMaterials = relations.rawMaterials ?? [];
      const duplicateIds = this.findDuplicateIds(
        rawMaterials.map((item) => item.rawMaterialId),
      );
      if (duplicateIds.length > 0) {
        throw new BadRequestException('Raw materials must be unique');
      }

      const existing = await tx.rawMaterial.findMany({
        where: {
          id: { in: rawMaterials.map((item) => item.rawMaterialId) },
          isDeleted: false,
        },
        select: { id: true },
      });

      if (existing.length !== rawMaterials.length) {
        throw new NotFoundException('One or more raw materials were not found');
      }
      return;
    }

    if (itemType === InventoryItemType.FINISHED_PRODUCT) {
      const semiProductIds = relations.semiProductIds ?? [];
      const machineIds = relations.machineIds ?? [];

      if (
        currentId &&
        currentType === InventoryItemType.SEMI_PRODUCT &&
        semiProductIds.includes(currentId)
      ) {
        throw new BadRequestException(
          'Finished product cannot reference the product being converted',
        );
      }

      const duplicateSemiIds = this.findDuplicateIds(semiProductIds);
      if (duplicateSemiIds.length > 0) {
        throw new BadRequestException('Semi products must be unique');
      }

      const duplicateMachineIds = this.findDuplicateIds(machineIds);
      if (duplicateMachineIds.length > 0) {
        throw new BadRequestException('Machines must be unique');
      }

      const [semiProducts, machines] = await Promise.all([
        tx.semiProduct.findMany({
          where: {
            id: { in: semiProductIds },
            isDeleted: false,
          },
          select: { id: true },
        }),
        tx.machine.findMany({
          where: { id: { in: machineIds } },
          select: { id: true },
        }),
      ]);

      if (semiProducts.length !== semiProductIds.length) {
        throw new NotFoundException('One or more semi products were not found');
      }
      if (machines.length !== machineIds.length) {
        throw new NotFoundException('One or more machines were not found');
      }
    }
  }

  private findDuplicateIds(ids: string[]) {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) {
        duplicates.add(id);
      }
      seen.add(id);
    }
    return [...duplicates];
  }

  private async createProductRecord(tx: Tx, input: ResolvedProductInput) {
    switch (input.itemType) {
      case InventoryItemType.RAW_MATERIAL: {
        const data: Prisma.RawMaterialUncheckedCreateInput = {
          name: input.name,
          unit: input.unit ?? 'kg',
          kind: input.rawMaterialKind ?? RawMaterialKind.SIRO,
          defaultBagWeightKg: input.defaultBagWeightKg ?? null,
          description: input.description ?? null,
        };
        return tx.rawMaterial.create({
          data,
        });
      }
      case InventoryItemType.SEMI_PRODUCT: {
        const item = await tx.semiProduct.create({
          data: {
            name: input.name,
            description: input.description,
            weightGram: input.weightGram!,
          },
        });
        await tx.semiProductRawMaterial.createMany({
          data: (input.relations.rawMaterials ?? []).map((rawMaterial) => ({
            semiProductId: item.id,
            rawMaterialId: rawMaterial.rawMaterialId,
            amountGram: rawMaterial.amountGram,
          })),
        });
        return item;
      }
      case InventoryItemType.FINISHED_PRODUCT: {
        const item = await tx.finishedProduct.create({
          data: {
            name: input.name,
            description: input.description,
            volumeLiter: input.volumeLiter!,
          },
        });
        await this.replaceFinishedProductRelations(tx, item.id, input.relations);
        return item;
      }
      default:
        throw new BadRequestException('Unsupported product type');
    }
  }

  private async updateProductRecord(
    tx: Tx,
    itemType: InventoryItemType,
    id: string,
    input: ResolvedProductInput,
  ) {
    switch (itemType) {
      case InventoryItemType.RAW_MATERIAL:
        {
          const data: Prisma.RawMaterialUncheckedUpdateInput = {
            name: input.name,
            unit: input.unit ?? 'kg',
            kind: input.rawMaterialKind ?? RawMaterialKind.SIRO,
            defaultBagWeightKg: input.defaultBagWeightKg ?? null,
            description: input.description ?? null,
          };
        await tx.rawMaterial.update({
          where: { id },
          data,
        });
        return;
        }
      case InventoryItemType.SEMI_PRODUCT:
        await tx.semiProduct.update({
          where: { id },
          data: {
            name: input.name,
            description: input.description,
            weightGram: input.weightGram!,
          },
        });
        await this.replaceSemiProductRelations(tx, id, input.relations);
        return;
      case InventoryItemType.FINISHED_PRODUCT:
        await tx.finishedProduct.update({
          where: { id },
          data: {
            name: input.name,
            description: input.description,
            volumeLiter: input.volumeLiter!,
          },
        });
        await this.replaceFinishedProductRelations(tx, id, input.relations);
        return;
      default:
        throw new BadRequestException('Unsupported product type');
    }
  }

  private async migrateProductType(
    tx: Tx,
    currentType: InventoryItemType,
    id: string,
    input: ResolvedProductInput,
  ) {
    switch (input.itemType) {
      case InventoryItemType.RAW_MATERIAL:
        {
          const data: Prisma.RawMaterialUncheckedCreateInput = {
            id,
            name: input.name,
            unit: input.unit ?? 'kg',
            kind: input.rawMaterialKind ?? RawMaterialKind.SIRO,
            defaultBagWeightKg: input.defaultBagWeightKg ?? null,
            description: input.description ?? null,
          };
          await tx.rawMaterial.create({ data });
        }
        break;
      case InventoryItemType.SEMI_PRODUCT:
        await tx.semiProduct.create({
          data: {
            id,
            name: input.name,
            description: input.description,
            weightGram: input.weightGram!,
          },
        });
        await this.replaceSemiProductRelations(tx, id, input.relations);
        break;
      case InventoryItemType.FINISHED_PRODUCT:
        await tx.finishedProduct.create({
          data: {
            id,
            name: input.name,
            description: input.description,
            volumeLiter: input.volumeLiter!,
          },
        });
        await this.replaceFinishedProductRelations(tx, id, input.relations);
        break;
      default:
        throw new BadRequestException('Unsupported product type');
    }

    await this.moveBalanceRecord(tx, currentType, input.itemType, id);
    await this.deleteSourceProductRecord(tx, currentType, id);
  }

  private async replaceSemiProductRelations(
    tx: Tx,
    semiProductId: string,
    relations: ResolvedProductInput['relations'],
  ) {
    await tx.semiProductRawMaterial.deleteMany({ where: { semiProductId } });
    if (!relations.rawMaterials?.length) {
      return;
    }

    await tx.semiProductRawMaterial.createMany({
      data: relations.rawMaterials.map((item) => ({
        semiProductId,
        rawMaterialId: item.rawMaterialId,
        amountGram: item.amountGram,
      })),
    });
  }

  private async replaceFinishedProductRelations(
    tx: Tx,
    finishedProductId: string,
    relations: ResolvedProductInput['relations'],
  ) {
    await tx.finishedProductSemiProduct.deleteMany({ where: { finishedProductId } });
    await tx.finishedProductMachine.deleteMany({ where: { finishedProductId } });

    if (relations.semiProductIds?.length) {
      await tx.finishedProductSemiProduct.createMany({
        data: relations.semiProductIds.map((semiProductId) => ({
          finishedProductId,
          semiProductId,
        })),
      });
    }

    if (relations.machineIds?.length) {
      await tx.finishedProductMachine.createMany({
        data: relations.machineIds.map((machineId) => ({
          finishedProductId,
          machineId,
        })),
      });
    }
  }

  private async ensureBalanceRecord(
    tx: Tx,
    itemType: InventoryItemType,
    name: string,
    quantity: number,
  ) {
    const item = await this.getProductOrThrow(tx, itemType, name);
    const existing = await tx.inventoryBalance.findFirst({
      where: this.getBalanceWhere(itemType, item.id),
    });

    if (existing) {
      return existing;
    }

    return tx.inventoryBalance.create({
      data: {
        itemType,
        quantity,
        rawMaterialId:
          itemType === InventoryItemType.RAW_MATERIAL ? item.id : undefined,
        semiProductId:
          itemType === InventoryItemType.SEMI_PRODUCT ? item.id : undefined,
        finishedProductId:
          itemType === InventoryItemType.FINISHED_PRODUCT ? item.id : undefined,
      },
    });
  }

  private async moveBalanceRecord(
    tx: Tx,
    currentType: InventoryItemType,
    nextType: InventoryItemType,
    id: string,
  ) {
    const balance = await tx.inventoryBalance.findFirst({
      where: this.getBalanceWhere(currentType, id),
    });

    if (!balance) {
      await tx.inventoryBalance.create({
        data: {
          itemType: nextType,
          quantity: 0,
          rawMaterialId:
            nextType === InventoryItemType.RAW_MATERIAL ? id : undefined,
          semiProductId:
            nextType === InventoryItemType.SEMI_PRODUCT ? id : undefined,
          finishedProductId:
            nextType === InventoryItemType.FINISHED_PRODUCT ? id : undefined,
        },
      });
      return;
    }

    await tx.inventoryBalance.update({
      where: { id: balance.id },
      data: {
        itemType: nextType,
        rawMaterialId:
          nextType === InventoryItemType.RAW_MATERIAL ? id : null,
        semiProductId:
          nextType === InventoryItemType.SEMI_PRODUCT ? id : null,
        finishedProductId:
          nextType === InventoryItemType.FINISHED_PRODUCT ? id : null,
      },
    });
  }

  private async deleteSourceProductRecord(
    tx: Tx,
    itemType: InventoryItemType,
    id: string,
  ) {
    switch (itemType) {
      case InventoryItemType.RAW_MATERIAL:
        await tx.rawMaterial.delete({ where: { id } });
        return;
      case InventoryItemType.SEMI_PRODUCT:
        await tx.semiProductRawMaterial.deleteMany({ where: { semiProductId: id } });
        await tx.semiProduct.delete({ where: { id } });
        return;
      case InventoryItemType.FINISHED_PRODUCT:
        await tx.finishedProductSemiProduct.deleteMany({
          where: { finishedProductId: id },
        });
        await tx.finishedProductMachine.deleteMany({
          where: { finishedProductId: id },
        });
        await tx.finishedProduct.delete({ where: { id } });
        return;
      default:
        throw new BadRequestException('Unsupported product type');
    }
  }

  private async createProductAuditLog(
    tx: Tx,
    itemType: InventoryItemType,
    entityId: string,
    actorId?: string,
    previousData?: ProductSnapshot,
    nextData?: ProductSnapshot,
    actionType?: ProductAuditActionType,
  ) {
    await tx.productAuditLog.create({
      data: {
        entityType: this.mapAuditEntityType(itemType),
        actionType:
          actionType ??
          (previousData
            ? ProductAuditActionType.UPDATED
            : ProductAuditActionType.CREATED),
        entityId,
        actorId,
        rawMaterialId:
          itemType === InventoryItemType.RAW_MATERIAL ? entityId : undefined,
        semiProductId:
          itemType === InventoryItemType.SEMI_PRODUCT ? entityId : undefined,
        finishedProductId:
          itemType === InventoryItemType.FINISHED_PRODUCT ? entityId : undefined,
        previousData: previousData
          ? this.toAuditJson(previousData)
          : undefined,
        nextData: nextData ? this.toAuditJson(nextData) : undefined,
      },
    });
  }

  private mapAuditEntityType(itemType: InventoryItemType) {
    switch (itemType) {
      case InventoryItemType.RAW_MATERIAL:
        return ProductAuditEntityType.RAW_MATERIAL;
      case InventoryItemType.SEMI_PRODUCT:
        return ProductAuditEntityType.SEMI_PRODUCT;
      case InventoryItemType.FINISHED_PRODUCT:
        return ProductAuditEntityType.FINISHED_PRODUCT;
      default:
        throw new BadRequestException('Unsupported product type');
    }
  }

  private toAuditJson(value: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }

  private getBalanceWhere(itemType: InventoryItemType, id: string) {
    switch (itemType) {
      case InventoryItemType.RAW_MATERIAL:
        return { rawMaterialId: id };
      case InventoryItemType.SEMI_PRODUCT:
        return { semiProductId: id };
      case InventoryItemType.FINISHED_PRODUCT:
        return { finishedProductId: id };
      default:
        throw new BadRequestException('Unsupported product type');
    }
  }

  private getBalanceRecord(tx: Tx, dto: InventoryMovementDto) {
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

  private async getProductOrThrow(
    tx: Tx,
    itemType: InventoryItemType,
    name: string,
  ) {
    switch (itemType) {
      case InventoryItemType.RAW_MATERIAL: {
        const item = await tx.rawMaterial.findFirst({
          where: { name, isDeleted: false },
          include: {
            productAuditLogs: {
              include: {
                actor: { select: { id: true, fullName: true } },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
        });
        if (!item) {
          throw new NotFoundException('Product not found');
        }
        return this.serializeRawMaterial(item);
      }
      case InventoryItemType.SEMI_PRODUCT: {
        const item = await tx.semiProduct.findFirst({
          where: { name, isDeleted: false },
          include: {
            rawMaterialLinks: {
              include: { rawMaterial: true },
              orderBy: { createdAt: 'asc' },
            },
            productAuditLogs: {
              include: {
                actor: { select: { id: true, fullName: true } },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
        });
        if (!item) {
          throw new NotFoundException('Product not found');
        }
        return this.serializeSemiProduct(item);
      }
      case InventoryItemType.FINISHED_PRODUCT: {
        const item = await tx.finishedProduct.findFirst({
          where: { name, isDeleted: false },
          include: {
            semiProductLinks: {
              include: { semiProduct: true },
              orderBy: { createdAt: 'asc' },
            },
            machineLinks: {
              include: { machine: true },
              orderBy: { createdAt: 'asc' },
            },
            productAuditLogs: {
              include: {
                actor: { select: { id: true, fullName: true } },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
        });
        if (!item) {
          throw new NotFoundException('Product not found');
        }
        return this.serializeFinishedProduct(item);
      }
      default:
        throw new BadRequestException('Unsupported product type');
    }
  }

  private async getProductByIdOrThrow(
    tx: Tx,
    itemType: InventoryItemType,
    id: string,
  ) {
    switch (itemType) {
      case InventoryItemType.RAW_MATERIAL: {
        const item = await tx.rawMaterial.findFirst({
          where: { id, isDeleted: false },
          include: {
            productAuditLogs: {
              include: {
                actor: { select: { id: true, fullName: true } },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
        });
        if (!item) {
          throw new NotFoundException('Product not found');
        }
        return this.serializeRawMaterial(item);
      }
      case InventoryItemType.SEMI_PRODUCT: {
        const item = await tx.semiProduct.findFirst({
          where: { id, isDeleted: false },
          include: {
            rawMaterialLinks: {
              include: { rawMaterial: true },
              orderBy: { createdAt: 'asc' },
            },
            productAuditLogs: {
              include: {
                actor: { select: { id: true, fullName: true } },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
        });
        if (!item) {
          throw new NotFoundException('Product not found');
        }
        return this.serializeSemiProduct(item);
      }
      case InventoryItemType.FINISHED_PRODUCT: {
        const item = await tx.finishedProduct.findFirst({
          where: { id, isDeleted: false },
          include: {
            semiProductLinks: {
              include: { semiProduct: true },
              orderBy: { createdAt: 'asc' },
            },
            machineLinks: {
              include: { machine: true },
              orderBy: { createdAt: 'asc' },
            },
            productAuditLogs: {
              include: {
                actor: { select: { id: true, fullName: true } },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
        });
        if (!item) {
          throw new NotFoundException('Product not found');
        }
        return this.serializeFinishedProduct(item);
      }
      default:
        throw new BadRequestException('Unsupported product type');
    }
  }

  private serializeRawMaterial(item: {
    id: string;
    name: string;
    unit: string;
    kind?: RawMaterialKind;
    defaultBagWeightKg?: number | null;
    description: string | null;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    productAuditLogs: Array<{
      actionType: ProductAuditActionType;
      createdAt: Date;
      actor: { id: string; fullName: string } | null;
    }>;
  }): ProductSnapshot {
    return {
      id: item.id,
      itemType: InventoryItemType.RAW_MATERIAL,
      name: item.name,
      unit: item.unit,
      rawMaterialKind: item.kind ?? RawMaterialKind.SIRO,
      defaultBagWeightKg: item.defaultBagWeightKg ?? undefined,
      description: item.description ?? undefined,
      isDeleted: item.isDeleted,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      audit: this.buildAuditSummary(item.productAuditLogs),
    };
  }

  private serializeSemiProduct(item: {
    id: string;
    name: string;
    weightGram: number;
    description: string | null;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    rawMaterialLinks: Array<{
      id: string;
      rawMaterialId: string;
      amountGram: number;
      rawMaterial: {
        id: string;
        name: string;
        unit: string;
      };
    }>;
    productAuditLogs: Array<{
      actionType: ProductAuditActionType;
      createdAt: Date;
      actor: { id: string; fullName: string } | null;
    }>;
  }): ProductSnapshot {
    return {
      id: item.id,
      itemType: InventoryItemType.SEMI_PRODUCT,
      name: item.name,
      weightGram: item.weightGram,
      description: item.description ?? undefined,
      isDeleted: item.isDeleted,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      rawMaterials: item.rawMaterialLinks.map((link) => ({
        id: link.id,
        rawMaterialId: link.rawMaterialId,
        name: link.rawMaterial.name,
        unit: link.rawMaterial.unit,
        amountGram: link.amountGram,
      })),
      audit: this.buildAuditSummary(item.productAuditLogs),
    };
  }

  private serializeFinishedProduct(item: {
    id: string;
    name: string;
    volumeLiter: number;
    description: string | null;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    semiProductLinks: Array<{
      id: string;
      semiProductId: string;
      semiProduct: {
        id: string;
        name: string;
        weightGram: number;
      };
    }>;
    machineLinks: Array<{
      id: string;
      machineId: string;
      machine: {
        id: string;
        name: string;
        stage: string;
        isActive: boolean;
      };
    }>;
    productAuditLogs: Array<{
      actionType: ProductAuditActionType;
      createdAt: Date;
      actor: { id: string; fullName: string } | null;
    }>;
  }): ProductSnapshot {
    return {
      id: item.id,
      itemType: InventoryItemType.FINISHED_PRODUCT,
      name: item.name,
      volumeLiter: item.volumeLiter,
      description: item.description ?? undefined,
      isDeleted: item.isDeleted,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      semiProducts: item.semiProductLinks.map((link) => ({
        id: link.id,
        semiProductId: link.semiProductId,
        name: link.semiProduct.name,
        weightGram: link.semiProduct.weightGram,
      })),
      machines: item.machineLinks.map((link) => ({
        id: link.id,
        machineId: link.machineId,
        name: link.machine.name,
        stage: link.machine.stage,
        isActive: link.machine.isActive,
      })),
      audit: this.buildAuditSummary(item.productAuditLogs),
    };
  }

  private buildAuditSummary(
    logs: Array<{
      actionType: ProductAuditActionType;
      createdAt: Date;
      actor: { id: string; fullName: string } | null;
    }>,
  ): ProductAuditSummary {
    const created = logs.find(
      (log) => log.actionType === ProductAuditActionType.CREATED,
    );
    const updated = [...logs]
      .reverse()
      .find((log) => log.actionType === ProductAuditActionType.UPDATED);
    const deleted = logs.find(
      (log) => log.actionType === ProductAuditActionType.DELETED,
    );

    return {
      createdAt: created?.createdAt.toISOString(),
      createdById: created?.actor?.id,
      createdByName: created?.actor?.fullName,
      updatedAt: updated?.createdAt.toISOString(),
      updatedById: updated?.actor?.id,
      updatedByName: updated?.actor?.fullName,
      deletedAt: deleted?.createdAt.toISOString(),
      deletedById: deleted?.actor?.id,
      deletedByName: deleted?.actor?.fullName,
    };
  }

  /**
   * Soft-delete (isDeleted) ruxsat: tarixdagi sotuv/ishlab chiqarish yozuvlari
   * mahsulot satrini saqlab qoladi — bloklash shart emas.
   * Bloklash: faqat omborda musbat qoldiq yoki xomashyo qoplari.
   */
  private async ensureProductCanBeDeletedTx(
    tx: Tx,
    itemType: InventoryItemType,
    id: string,
  ) {
    switch (itemType) {
      case InventoryItemType.RAW_MATERIAL: {
        const [item, balance, bagCount] = await Promise.all([
          tx.rawMaterial.findUnique({ where: { id } }),
          tx.inventoryBalance.findFirst({ where: { rawMaterialId: id } }),
          tx.rawMaterialBag.count({ where: { rawMaterialId: id } }),
        ]);

        if (!item || item.isDeleted) {
          throw new NotFoundException('Product not found');
        }

        if ((balance?.quantity ?? 0) > 0) {
          throw new BadRequestException('WAREHOUSE_DELETE_STOCK_REMAINS');
        }
        if (bagCount > 0) {
          throw new BadRequestException('WAREHOUSE_DELETE_RAW_BAGS_EXIST');
        }
        return;
      }
      case InventoryItemType.SEMI_PRODUCT: {
        const [item, balance] = await Promise.all([
          tx.semiProduct.findUnique({ where: { id } }),
          tx.inventoryBalance.findFirst({ where: { semiProductId: id } }),
        ]);

        if (!item || item.isDeleted) {
          throw new NotFoundException('Product not found');
        }

        if ((balance?.quantity ?? 0) > 0) {
          throw new BadRequestException('WAREHOUSE_DELETE_STOCK_REMAINS');
        }
        return;
      }
      case InventoryItemType.FINISHED_PRODUCT: {
        const [item, balance] = await Promise.all([
          tx.finishedProduct.findUnique({ where: { id } }),
          tx.inventoryBalance.findFirst({ where: { finishedProductId: id } }),
        ]);

        if (!item || item.isDeleted) {
          throw new NotFoundException('Product not found');
        }

        if ((balance?.quantity ?? 0) > 0) {
          throw new BadRequestException('WAREHOUSE_DELETE_STOCK_REMAINS');
        }
        return;
      }
      default:
        throw new BadRequestException('Unsupported product type');
    }
  }
}
