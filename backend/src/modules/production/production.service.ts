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

/** Smena retsept xatolari — frontend `ERR::` ni tarjima qiladi */
function shiftInventoryErr(code: string, param?: string): string {
  if (param != null && param !== '') {
    return `ERR::${code}::${encodeURIComponent(param)}`;
  }
  return `ERR::${code}`;
}

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
    await this.rawMaterialBagsService.reverseBagConsumptionForShiftReference(
      tx,
      shiftId,
    );

    const movements = await tx.inventoryMovement.findMany({
      where: { referenceType: 'shift', referenceId: shiftId },
    });

    for (const movement of movements) {
      if (movement.movementType === MovementType.CONSUMPTION) {
        if (
          movement.itemType === InventoryItemType.RAW_MATERIAL &&
          movement.rawMaterialId
        ) {
          const balance = await tx.inventoryBalance.findFirst({
            where: { rawMaterialId: movement.rawMaterialId },
          });
          if (balance) {
            await tx.inventoryBalance.update({
              where: { id: balance.id },
              data: { quantity: balance.quantity + movement.quantity },
            });
          }
        } else if (
          movement.itemType === InventoryItemType.SEMI_PRODUCT &&
          movement.semiProductId
        ) {
          const balance = await tx.inventoryBalance.findFirst({
            where: { semiProductId: movement.semiProductId },
          });
          if (balance) {
            await tx.inventoryBalance.update({
              where: { id: balance.id },
              data: { quantity: balance.quantity + movement.quantity },
            });
          }
        }
      } else if (movement.movementType === MovementType.PRODUCTION_OUTPUT) {
        if (
          movement.itemType === InventoryItemType.SEMI_PRODUCT &&
          movement.semiProductId
        ) {
          const balance = await tx.inventoryBalance.findFirst({
            where: { semiProductId: movement.semiProductId },
          });
          if (balance) {
            await tx.inventoryBalance.update({
              where: { id: balance.id },
              data: { quantity: balance.quantity - movement.quantity },
            });
          }
        } else if (
          movement.itemType === InventoryItemType.FINISHED_PRODUCT &&
          movement.finishedProductId
        ) {
          const balance = await tx.inventoryBalance.findFirst({
            where: { finishedProductId: movement.finishedProductId },
          });
          if (balance) {
            await tx.inventoryBalance.update({
              where: { id: balance.id },
              data: { quantity: balance.quantity - movement.quantity },
            });
          }
        }
      }

      await tx.inventoryMovement.delete({ where: { id: movement.id } });
    }
  }

  /**
   * Smena yozuvi bo‘yicha retseptdan siro/yarim tayyor sarfi va tayyor/yarim mahsulotni omborga qo‘shish.
   * Kraska retsept qatorlari alohida {@link applyShiftPaintConsumption} orqali.
   */
  private async applyShiftRecipeAndOutput(
    tx: Tx,
    params: {
      shiftId: string;
      workerId: string;
      machine: { id: string; stage: ProductionStage } | null;
      productLabel: string | null | undefined;
      producedQty: number;
      defectCount: number;
    },
  ) {
    const materialUnits = params.producedQty + params.defectCount;
    const goodPieces = params.producedQty;
    if (materialUnits <= 0 && goodPieces <= 0) {
      return;
    }

    const label = params.productLabel?.trim();
    if (!label) {
      if (materialUnits > 0) {
        throw new BadRequestException(
          shiftInventoryErr('PRODUCT_TYPE_REQUIRED'),
        );
      }
      return;
    }

    if (!params.machine) {
      if (materialUnits > 0) {
        throw new BadRequestException(shiftInventoryErr('MACHINE_REQUIRED'));
      }
      return;
    }

    const machine = params.machine;

    if (machine.stage === ProductionStage.SEMI) {
      const semi = await tx.semiProduct.findFirst({
        where: {
          name: { equals: label, mode: 'insensitive' },
          isDeleted: false,
        },
        include: {
          rawMaterialLinks: { include: { rawMaterial: true } },
        },
      });

      if (!semi) {
        throw new BadRequestException(
          shiftInventoryErr('SEMI_NOT_FOUND', label),
        );
      }

      for (const link of semi.rawMaterialLinks) {
        const rm = link.rawMaterial;
        if (rm.isDeleted) {
          continue;
        }
        if (rm.kind === RawMaterialKind.PAINT) {
          continue;
        }

        const qtyKg = (link.amountGram * materialUnits) / 1000;
        if (qtyKg <= 0) {
          continue;
        }

        const balance = await tx.inventoryBalance.findFirst({
          where: { rawMaterialId: rm.id },
        });
        if (!balance || balance.quantity + 0.0001 < qtyKg) {
          throw new BadRequestException(
            shiftInventoryErr('RAW_INSUFFICIENT', rm.name),
          );
        }

        const newQty = balance.quantity - qtyKg;
        await tx.inventoryBalance.update({
          where: { id: balance.id },
          data: { quantity: newQty },
        });

        await tx.inventoryMovement.create({
          data: {
            itemType: InventoryItemType.RAW_MATERIAL,
            movementType: MovementType.CONSUMPTION,
            quantity: qtyKg,
            previousQuantity: balance.quantity,
            newQuantity: newQty,
            rawMaterialId: rm.id,
            createdById: params.workerId,
            referenceType: 'shift',
            referenceId: params.shiftId,
            status: EntityStatus.COMPLETED,
            note: 'Smena: retsept bo‘yicha siro sarfi',
          },
        });

        await this.rawMaterialBagsService.consumeFromActiveBagAfterInventoryAlreadyDeducted(
          tx,
          {
            rawMaterialId: rm.id,
            quantityKg: qtyKg,
            createdById: params.workerId,
            note: 'Smena: retsept bo‘yicha siro sarfi (ulangan qop)',
            referenceType: 'shift',
            referenceId: params.shiftId,
          },
        );
      }

      if (goodPieces > 0) {
        const semiBalance = await tx.inventoryBalance.findFirst({
          where: { semiProductId: semi.id },
        });
        if (!semiBalance) {
          throw new BadRequestException(
            shiftInventoryErr('SEMI_BALANCE_MISSING'),
          );
        }

        const newSemiQty = semiBalance.quantity + goodPieces;
        await tx.inventoryBalance.update({
          where: { id: semiBalance.id },
          data: { quantity: newSemiQty },
        });

        await tx.inventoryMovement.create({
          data: {
            itemType: InventoryItemType.SEMI_PRODUCT,
            movementType: MovementType.PRODUCTION_OUTPUT,
            quantity: goodPieces,
            previousQuantity: semiBalance.quantity,
            newQuantity: newSemiQty,
            semiProductId: semi.id,
            createdById: params.workerId,
            referenceType: 'shift',
            referenceId: params.shiftId,
            status: EntityStatus.COMPLETED,
            note: 'Smena: ishlab chiqarish',
          },
        });
      }

      return;
    }

    const finished = await tx.finishedProduct.findFirst({
      where: {
        name: { equals: label, mode: 'insensitive' },
        isDeleted: false,
      },
      include: {
        semiProductLinks: true,
        machineLinks: true,
      },
    });

    if (!finished) {
      throw new BadRequestException(
        shiftInventoryErr('FINISHED_NOT_FOUND', label),
      );
    }

    const machineOk = finished.machineLinks.some(
      (l) => l.machineId === machine.id,
    );
    if (!machineOk) {
      throw new BadRequestException(shiftInventoryErr('MACHINE_NOT_LINKED'));
    }

    if (finished.semiProductLinks.length === 0) {
      throw new BadRequestException(
        shiftInventoryErr('FINISHED_NO_SEMI_RECIPE'),
      );
    }

    for (const link of finished.semiProductLinks) {
      const qtyPieces = materialUnits;
      const semiBal = await tx.inventoryBalance.findFirst({
        where: { semiProductId: link.semiProductId },
      });
      const semiMeta = await tx.semiProduct.findUnique({
        where: { id: link.semiProductId },
        select: { name: true },
      });

      if (!semiBal || semiBal.quantity + 0.0001 < qtyPieces) {
        throw new BadRequestException(
          shiftInventoryErr(
            'INSUFFICIENT_SEMI_STOCK',
            semiMeta?.name ?? link.semiProductId,
          ),
        );
      }

      const newSemiQty = semiBal.quantity - qtyPieces;
      await tx.inventoryBalance.update({
        where: { id: semiBal.id },
        data: { quantity: newSemiQty },
      });

      await tx.inventoryMovement.create({
        data: {
          itemType: InventoryItemType.SEMI_PRODUCT,
          movementType: MovementType.CONSUMPTION,
          quantity: qtyPieces,
          previousQuantity: semiBal.quantity,
          newQuantity: newSemiQty,
          semiProductId: link.semiProductId,
          createdById: params.workerId,
          referenceType: 'shift',
          referenceId: params.shiftId,
          status: EntityStatus.COMPLETED,
          note: 'Smena: tayyor mahsulot uchun yarim tayyor sarfi',
        },
      });
    }

    if (goodPieces > 0) {
      const fpBal = await tx.inventoryBalance.findFirst({
        where: { finishedProductId: finished.id },
      });
      if (!fpBal) {
        throw new BadRequestException(
          shiftInventoryErr('FINISHED_BALANCE_MISSING'),
        );
      }

      const newFp = fpBal.quantity + goodPieces;
      await tx.inventoryBalance.update({
        where: { id: fpBal.id },
        data: { quantity: newFp },
      });

      await tx.inventoryMovement.create({
        data: {
          itemType: InventoryItemType.FINISHED_PRODUCT,
          movementType: MovementType.PRODUCTION_OUTPUT,
          quantity: goodPieces,
          previousQuantity: fpBal.quantity,
          newQuantity: newFp,
          finishedProductId: finished.id,
          createdById: params.workerId,
          referenceType: 'shift',
          referenceId: params.shiftId,
          status: EntityStatus.COMPLETED,
          note: 'Smena: ishlab chiqarish',
        },
      });
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

    await this.rawMaterialBagsService.consumeFromActiveBagAfterInventoryAlreadyDeducted(
      tx,
      {
        rawMaterialId: params.rawMaterialId,
        quantityKg: params.quantityKg,
        createdById: params.workerId,
        note: 'Smena: kraska/bo‘yoq sarfi (ulangan qop)',
        referenceType: 'shift',
        referenceId: params.shiftId,
      },
    );
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

      const machine = dto.machineId
        ? await tx.machine.findUnique({ where: { id: dto.machineId } })
        : null;

      await this.applyShiftRecipeAndOutput(tx, {
        shiftId: shift.id,
        workerId: dto.workerId,
        machine,
        productLabel: dto.productLabel,
        producedQty: dto.producedQty,
        defectCount: dto.defectCount ?? 0,
      });

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

      const machine = nextMachineId
        ? await tx.machine.findUnique({ where: { id: nextMachineId } })
        : null;

      const nextProductLabel =
        dto.productLabel !== undefined ? dto.productLabel : existing.productLabel;
      const nextProducedQty =
        dto.producedQty !== undefined ? dto.producedQty : existing.producedQty;
      const nextDefectCount =
        dto.defectCount !== undefined
          ? dto.defectCount
          : existing.defectCount;

      await this.applyShiftRecipeAndOutput(tx, {
        shiftId: shift.id,
        workerId: nextWorkerId,
        machine,
        productLabel: nextProductLabel,
        producedQty: nextProducedQty,
        defectCount: nextDefectCount,
      });

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
