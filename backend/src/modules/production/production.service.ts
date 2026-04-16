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
  ProductionStage,
  RawMaterialKind,
} from '../../generated/prisma/enums.js';
import { Prisma } from '../../generated/prisma/client.js';

type Tx = Prisma.TransactionClient;
import { RealtimeGateway } from '../../socket/realtime.gateway.js';
import { RawMaterialBagsService } from '../raw-material-bags/raw-material-bags.service.js';
import { CreateMachineDto } from './dto/create-machine.dto.js';
import { CreateProductionDto } from './dto/create-production.dto.js';
import { CreateShiftRecordDto } from './dto/create-shift-record.dto.js';
import { UpdateShiftRecordDto } from './dto/update-shift-record.dto.js';

@Injectable()
export class ProductionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly rawMaterialBagsService: RawMaterialBagsService,
  ) {}

  createMachine(dto: CreateMachineDto) {
    return this.prisma.machine.create({
      data: {
        ...dto,
        isActive: dto.isActive ?? true,
      },
    });
  }

  getMachines() {
    return this.prisma.machine.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleMachine(id: string) {
    const machine = await this.prisma.machine.findUnique({
      where: { id },
    });

    if (!machine) {
      throw new NotFoundException('Machine not found');
    }

    return this.prisma.machine.update({
      where: { id },
      data: {
        isActive: !machine.isActive,
      },
    });
  }

  async deleteMachine(id: string) {
    const machine = await this.prisma.machine.findUnique({
      where: { id },
    });

    if (!machine) {
      throw new NotFoundException('Machine not found');
    }

    await this.prisma.machine.delete({
      where: { id },
    });

    return { success: true };
  }

  async createProduction(dto: CreateProductionDto) {
    if (dto.stage === ProductionStage.SEMI && !dto.outputSemiProductId) {
      throw new BadRequestException(
        'Semi production requires outputSemiProductId',
      );
    }

    if (
      dto.stage === ProductionStage.FINISHED &&
      !dto.outputFinishedProductId
    ) {
      throw new BadRequestException(
        'Finished production requires outputFinishedProductId',
      );
    }

    const worker = await this.prisma.user.findUnique({
      where: { id: dto.workerId },
    });
    if (!worker) {
      throw new NotFoundException('Worker not found');
    }

    const record = await this.prisma.$transaction(async (tx) => {
      for (const item of dto.consumptions) {
        const balance = await tx.inventoryBalance.findFirst({
          where:
            item.itemType === InventoryItemType.RAW_MATERIAL
              ? { rawMaterialId: item.rawMaterialId }
              : { semiProductId: item.semiProductId },
        });

        if (!balance || balance.quantity < item.quantity) {
          throw new BadRequestException(
            'Insufficient input stock for production',
          );
        }

        await tx.inventoryBalance.update({
          where: { id: balance.id },
          data: { quantity: balance.quantity - item.quantity },
        });

        await tx.inventoryMovement.create({
          data: {
            itemType: item.itemType,
            movementType: MovementType.CONSUMPTION,
            quantity: item.quantity,
            previousQuantity: balance.quantity,
            newQuantity: balance.quantity - item.quantity,
            createdById: dto.workerId,
            rawMaterialId: item.rawMaterialId,
            semiProductId: item.semiProductId,
            referenceType: 'production',
            status: EntityStatus.COMPLETED,
          },
        });

      }

      const production = await tx.productionRecord.create({
        data: {
          stage: dto.stage,
          workerId: dto.workerId,
          machineId: dto.machineId,
          outputSemiProductId: dto.outputSemiProductId,
          outputFinishedProductId: dto.outputFinishedProductId,
          quantityProduced: dto.quantityProduced,
          waste: dto.waste ?? 0,
          note: dto.note,
          timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
          status: EntityStatus.COMPLETED,
          consumptions: {
            create: dto.consumptions.map((item) => ({
              itemType: item.itemType,
              rawMaterialId: item.rawMaterialId,
              semiProductId: item.semiProductId,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          consumptions: true,
          worker: {
            omit: { passwordHash: true },
          },
          machine: true,
          outputSemiProduct: true,
          outputFinishedProduct: true,
        },
      });

      for (const item of dto.consumptions) {
        if (item.itemType !== InventoryItemType.RAW_MATERIAL) {
          continue;
        }

        await this.rawMaterialBagsService.consumeFromActiveBagForProduction(
          tx,
          {
            rawMaterialId: item.rawMaterialId!,
            quantityKg: item.quantity,
            createdById: dto.workerId,
            note: dto.note ?? 'Production consumption',
            referenceType: 'production',
            referenceId: production.id,
            consumedAt: dto.timestamp ? new Date(dto.timestamp) : new Date(),
          },
        );
      }

      if (dto.stage === ProductionStage.SEMI) {
        const balance = await tx.inventoryBalance.findFirst({
          where: { semiProductId: dto.outputSemiProductId },
        });
        if (!balance) {
          throw new NotFoundException('Semi product balance not found');
        }

        await tx.inventoryBalance.update({
          where: { id: balance.id },
          data: { quantity: balance.quantity + dto.quantityProduced },
        });

        await tx.inventoryMovement.create({
          data: {
            itemType: InventoryItemType.SEMI_PRODUCT,
            movementType: MovementType.PRODUCTION_OUTPUT,
            quantity: dto.quantityProduced,
            previousQuantity: balance.quantity,
            newQuantity: balance.quantity + dto.quantityProduced,
            semiProductId: dto.outputSemiProductId,
            createdById: dto.workerId,
            referenceType: 'production',
            referenceId: production.id,
          },
        });
      }

      if (dto.stage === ProductionStage.FINISHED) {
        const balance = await tx.inventoryBalance.findFirst({
          where: { finishedProductId: dto.outputFinishedProductId },
        });
        if (!balance) {
          throw new NotFoundException('Finished product balance not found');
        }

        await tx.inventoryBalance.update({
          where: { id: balance.id },
          data: { quantity: balance.quantity + dto.quantityProduced },
        });

        await tx.inventoryMovement.create({
          data: {
            itemType: InventoryItemType.FINISHED_PRODUCT,
            movementType: MovementType.PRODUCTION_OUTPUT,
            quantity: dto.quantityProduced,
            previousQuantity: balance.quantity,
            newQuantity: balance.quantity + dto.quantityProduced,
            finishedProductId: dto.outputFinishedProductId,
            createdById: dto.workerId,
            referenceType: 'production',
            referenceId: production.id,
          },
        });
      }

      return production;
    });

    this.realtimeGateway.emitProductionUpdated(record);
    this.realtimeGateway.emitWarehouseUpdated({
      source: 'production',
      productionId: record.id,
    });

    return record;
  }

  private async reverseShiftInventoryMovements(tx: Tx, shiftId: string) {
    const movements = await tx.inventoryMovement.findMany({
      where: { referenceType: 'shift', referenceId: shiftId },
    });

    for (const movement of movements) {
      if (
        movement.itemType !== InventoryItemType.RAW_MATERIAL ||
        !movement.rawMaterialId
      ) {
        await tx.inventoryMovement.delete({ where: { id: movement.id } });
        continue;
      }

      const balance = await tx.inventoryBalance.findFirst({
        where: { rawMaterialId: movement.rawMaterialId },
      });

      if (balance) {
        await tx.inventoryBalance.update({
          where: { id: balance.id },
          data: { quantity: balance.quantity + movement.quantity },
        });
      }

      await tx.inventoryMovement.delete({ where: { id: movement.id } });
    }
  }

  private async applyShiftPaintConsumption(
    tx: Tx,
    params: {
      shiftId: string;
      workerId: string;
      rawMaterialId: string;
      quantityKg: number;
    },
  ) {
    const balance = await tx.inventoryBalance.findFirst({
      where: { rawMaterialId: params.rawMaterialId },
    });

    if (!balance || balance.quantity < params.quantityKg) {
      throw new BadRequestException('Kraska/xomashyo omborda yetarli emas');
    }

    const newQty = balance.quantity - params.quantityKg;

    await tx.inventoryBalance.update({
      where: { id: balance.id },
      data: { quantity: newQty },
    });

    await tx.inventoryMovement.create({
      data: {
        itemType: InventoryItemType.RAW_MATERIAL,
        movementType: MovementType.CONSUMPTION,
        quantity: params.quantityKg,
        previousQuantity: balance.quantity,
        newQuantity: newQty,
        rawMaterialId: params.rawMaterialId,
        referenceType: 'shift',
        referenceId: params.shiftId,
        createdById: params.workerId,
        status: EntityStatus.COMPLETED,
        note: 'Smena: kraska/bo‘yoq sarfi',
      },
    });
  }

  async createShiftRecord(dto: CreateShiftRecordDto) {
    const wantsPaint =
      dto.paintUsed === true &&
      Boolean(dto.paintRawMaterialId) &&
      dto.paintQuantityKg != null &&
      dto.paintQuantityKg > 0;

    if (dto.paintUsed === true && !wantsPaint) {
      throw new BadRequestException(
        'Kraska ishlatilgani belgilansa — xomashyo va miqdor (kg) kiritilishi kerak',
      );
    }

    if (wantsPaint) {
      if (!dto.machineId) {
        throw new BadRequestException('Kraska uchun apparat tanlanishi kerak');
      }
      const machine = await this.prisma.machine.findUnique({
        where: { id: dto.machineId },
      });
      if (!machine || machine.stage !== ProductionStage.SEMI) {
        throw new BadRequestException(
          'Kraska faqat yarim tayyor (qolip) apparati uchun yoziladi',
        );
      }
      const paintRm = await this.prisma.rawMaterial.findFirst({
        where: { id: dto.paintRawMaterialId!, isDeleted: false },
      });
      if (!paintRm || paintRm.kind !== RawMaterialKind.PAINT) {
        throw new BadRequestException(
          'Kraska uchun «kraska» turidagi xomashyo (siro sahifasida yaratilgan) tanlanishi kerak',
        );
      }
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const shift = await tx.shiftRecord.create({
        data: {
          workerId: dto.workerId,
          machineId: dto.machineId,
          shiftNumber: dto.shiftNumber,
          date: new Date(dto.date),
          hoursWorked: dto.hoursWorked,
          productLabel: dto.productLabel,
          machineReading: dto.machineReading,
          producedQty: dto.producedQty,
          defectCount: dto.defectCount ?? 0,
          electricityKwh: dto.electricityKwh ?? 0,
          notes: dto.notes,
          paintUsed: wantsPaint,
          paintRawMaterialId: wantsPaint ? dto.paintRawMaterialId! : null,
          paintQuantityKg: wantsPaint ? dto.paintQuantityKg! : null,
        },
      });

      if (wantsPaint) {
        await this.applyShiftPaintConsumption(tx, {
          shiftId: shift.id,
          workerId: dto.workerId,
          rawMaterialId: dto.paintRawMaterialId!,
          quantityKg: dto.paintQuantityKg!,
        });
      }

      return tx.shiftRecord.findUniqueOrThrow({
        where: { id: shift.id },
        include: {
          worker: {
            omit: { passwordHash: true },
          },
          machine: true,
          paintRawMaterial: { select: { id: true, name: true, unit: true } },
        },
      });
    });

    this.realtimeGateway.emitWarehouseUpdated({
      source: 'shift',
      shiftId: created.id,
    });

    return created;
  }

  async updateShiftRecord(id: string, dto: UpdateShiftRecordDto) {
    const existing = await this.prisma.shiftRecord.findUnique({
      where: { id },
      include: { machine: true },
    });

    if (!existing) {
      throw new NotFoundException('Shift record not found');
    }

    const nextWorkerId =
      dto.workerId !== undefined ? dto.workerId : existing.workerId;
    const nextMachineId =
      dto.machineId !== undefined ? dto.machineId || null : existing.machineId;
    const nextPaintUsed =
      dto.paintUsed !== undefined ? dto.paintUsed : existing.paintUsed;
    const nextPaintRawMaterialId =
      dto.paintRawMaterialId !== undefined
        ? dto.paintRawMaterialId
        : existing.paintRawMaterialId;
    const nextPaintQuantityKg =
      dto.paintQuantityKg !== undefined
        ? dto.paintQuantityKg
        : existing.paintQuantityKg;

    const wantsPaint =
      nextPaintUsed === true &&
      Boolean(nextPaintRawMaterialId) &&
      nextPaintQuantityKg != null &&
      nextPaintQuantityKg > 0;

    if (nextPaintUsed === true && !wantsPaint) {
      throw new BadRequestException(
        'Kraska ishlatilgani belgilansa — xomashyo va miqdor (kg) kiritilishi kerak',
      );
    }

    if (wantsPaint) {
      if (!nextMachineId) {
        throw new BadRequestException('Kraska uchun apparat tanlanishi kerak');
      }
      const machine = await this.prisma.machine.findUnique({
        where: { id: nextMachineId },
      });
      if (!machine || machine.stage !== ProductionStage.SEMI) {
        throw new BadRequestException(
          'Kraska faqat yarim tayyor (qolip) apparati uchun yoziladi',
        );
      }
      const paintRm = await this.prisma.rawMaterial.findFirst({
        where: { id: nextPaintRawMaterialId!, isDeleted: false },
      });
      if (!paintRm || paintRm.kind !== RawMaterialKind.PAINT) {
        throw new BadRequestException(
          'Kraska uchun «kraska» turidagi xomashyo (siro sahifasida yaratilgan) tanlanishi kerak',
        );
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await this.reverseShiftInventoryMovements(tx, id);

      const shift = await tx.shiftRecord.update({
        where: { id },
        data: {
          ...(dto.workerId !== undefined ? { workerId: dto.workerId } : {}),
          ...(dto.machineId !== undefined ? { machineId: dto.machineId || null } : {}),
          ...(dto.shiftNumber !== undefined ? { shiftNumber: dto.shiftNumber } : {}),
          ...(dto.date !== undefined ? { date: new Date(dto.date) } : {}),
          ...(dto.hoursWorked !== undefined ? { hoursWorked: dto.hoursWorked } : {}),
          ...(dto.productLabel !== undefined ? { productLabel: dto.productLabel } : {}),
          ...(dto.machineReading !== undefined
            ? { machineReading: dto.machineReading }
            : {}),
          ...(dto.producedQty !== undefined ? { producedQty: dto.producedQty } : {}),
          ...(dto.defectCount !== undefined ? { defectCount: dto.defectCount } : {}),
          ...(dto.electricityKwh !== undefined
            ? { electricityKwh: dto.electricityKwh }
            : {}),
          ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
          paintUsed: wantsPaint,
          paintRawMaterialId: wantsPaint ? nextPaintRawMaterialId! : null,
          paintQuantityKg: wantsPaint ? nextPaintQuantityKg! : null,
        },
      });

      if (wantsPaint) {
        await this.applyShiftPaintConsumption(tx, {
          shiftId: shift.id,
          workerId: nextWorkerId,
          rawMaterialId: nextPaintRawMaterialId!,
          quantityKg: nextPaintQuantityKg!,
        });
      }

      return tx.shiftRecord.findUniqueOrThrow({
        where: { id: shift.id },
        include: {
          worker: {
            omit: { passwordHash: true },
          },
          machine: true,
          paintRawMaterial: { select: { id: true, name: true, unit: true } },
        },
      });
    });

    this.realtimeGateway.emitWarehouseUpdated({
      source: 'shift',
      shiftId: updated.id,
    });

    return updated;
  }

  async deleteShiftRecord(id: string) {
    const record = await this.prisma.shiftRecord.findUnique({
      where: { id },
    });

    if (!record) {
      throw new NotFoundException('Shift record not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await this.reverseShiftInventoryMovements(tx, id);
      await tx.shiftRecord.delete({
        where: { id },
      });
    });

    this.realtimeGateway.emitWarehouseUpdated({
      source: 'shift-deleted',
      shiftId: id,
    });

    return { success: true };
  }

  getProductions() {
    return this.prisma.productionRecord.findMany({
      include: {
        consumptions: true,
        worker: {
          omit: { passwordHash: true },
        },
        machine: true,
        outputSemiProduct: true,
        outputFinishedProduct: true,
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  getShiftRecords() {
    return this.prisma.shiftRecord.findMany({
      include: {
        worker: {
          omit: { passwordHash: true },
        },
        machine: true,
        paintRawMaterial: { select: { id: true, name: true, unit: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
