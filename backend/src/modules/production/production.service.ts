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
  Role,
  ShiftRecordKind,
} from '../../generated/prisma/enums.js';
import { Prisma } from '../../generated/prisma/client.js';

type Tx = Prisma.TransactionClient;
import { RealtimeGateway } from '../../socket/realtime.gateway.js';
import { RawMaterialBagsService } from '../raw-material-bags/raw-material-bags.service.js';
import { FinanceService } from '../finance/finance.service.js';
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

const shiftRecordDetailsInclude = {
  worker: {
    omit: { passwordHash: true },
  },
  createdBy: {
    select: { id: true, fullName: true },
  },
  machine: true,
  paintRawMaterial: { select: { id: true, name: true, unit: true } },
  materialUsages: {
    include: {
      rawMaterial: { select: { id: true, name: true, unit: true } },
    },
  },
} as const;

@Injectable()
export class ProductionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly rawMaterialBagsService: RawMaterialBagsService,
    private readonly financeService: FinanceService,
  ) {}

  /** Yangi ёзув / ишчини алмаштириш — фақат фаол WORKER */
  private async assertActiveWorkerForShiftAssignment(workerId: string) {
    const worker = await this.prisma.user.findUnique({ where: { id: workerId } });
    if (!worker) {
      throw new NotFoundException('Worker not found');
    }
    if (worker.role !== Role.WORKER) {
      throw new BadRequestException('Smena uchun ishchi (WORKER) tanlanishi kerak');
    }
    if (!worker.isActive) {
      throw new BadRequestException(
        'Bu ishchi ro‘yxatdan chiqarilgan — yangi smena yozuvi uchun faol ishchi tanlang',
      );
    }
  }

  createMachine(dto: CreateMachineDto) {
    return this.prisma.machine.create({
      data: {
        ...dto,
        powerKw: dto.powerKw ?? 0,
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

  private normalizeRawMaterialActualKg(
    rows: { rawMaterialId: string; quantityKg: number }[] | undefined | null,
  ): Record<string, number> {
    const out: Record<string, number> = {};
    if (!rows?.length) {
      return out;
    }
    for (const r of rows) {
      const id = String(r.rawMaterialId ?? '').trim();
      if (!id) {
        continue;
      }
      const q = Number(r.quantityKg);
      if (!Number.isFinite(q) || q <= 0) {
        throw new BadRequestException(
          shiftInventoryErr('RAW_ACTUAL_INVALID', id),
        );
      }
      out[id] = q;
    }
    return out;
  }

  private async reverseShiftInventoryMovements(tx: Tx, shiftId: string) {
    await tx.shiftMaterialUsage.deleteMany({ where: { shiftId } });
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
      } else if (movement.movementType === MovementType.ADJUSTMENT) {
        const isPackaging =
          movement.referenceType === 'shift' &&
          (movement.note?.includes('qadoqlash') ?? false);
        if (isPackaging) {
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
                data: {
                  packagedQuantity: Math.max(
                    0,
                    balance.packagedQuantity - movement.quantity,
                  ),
                },
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
                data: {
                  packagedQuantity: Math.max(
                    0,
                    balance.packagedQuantity - movement.quantity,
                  ),
                },
              });
            }
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
      /** Qolip retsepti: rawMaterialId → haqiqiy sarflangan kg (bo‘lmasa retsept bo‘yicha) */
      rawMaterialActualKg?: Record<string, number>;
      outputNote?: string;
    },
  ) {
    const finishedOutputNote = params.outputNote ?? 'Smena: ishlab chiqarish';
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
    const rawOverrides = params.rawMaterialActualKg ?? {};
    if (
      Object.keys(rawOverrides).length > 0 &&
      machine.stage !== ProductionStage.SEMI
    ) {
      throw new BadRequestException(
        shiftInventoryErr('RAW_OVERRIDE_SEMI_ONLY'),
      );
    }

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

      const recipeLinks = semi.rawMaterialLinks.filter((link) => {
        const rm = link.rawMaterial;
        if (rm.isDeleted) {
          return false;
        }
        if (rm.kind === RawMaterialKind.PAINT) {
          return false;
        }
        return true;
      });
      const recipeIds = new Set(recipeLinks.map((l) => l.rawMaterial.id));
      for (const rid of Object.keys(rawOverrides)) {
        if (!recipeIds.has(rid)) {
          throw new BadRequestException(
            shiftInventoryErr('RAW_OVERRIDE_UNKNOWN', rid),
          );
        }
      }

      for (const link of recipeLinks) {
        const rm = link.rawMaterial;

        const expectedKg = (link.amountGram * materialUnits) / 1000;
        if (expectedKg <= 0) {
          continue;
        }

        const actualKg =
          rawOverrides[rm.id] !== undefined ? rawOverrides[rm.id]! : expectedKg;
        if (!(actualKg > 0) || !Number.isFinite(actualKg)) {
          throw new BadRequestException(
            shiftInventoryErr('RAW_ACTUAL_INVALID', rm.name),
          );
        }

        const balance = await tx.inventoryBalance.findFirst({
          where: { rawMaterialId: rm.id },
        });
        if (!balance || balance.quantity + 0.0001 < actualKg) {
          throw new BadRequestException(
            shiftInventoryErr('RAW_INSUFFICIENT', rm.name),
          );
        }

        const newQty = balance.quantity - actualKg;
        await tx.inventoryBalance.update({
          where: { id: balance.id },
          data: { quantity: newQty },
        });

        const deltaKg = actualKg - expectedKg;
        const noteBase =
          Math.abs(deltaKg) < 1e-5
            ? 'Smena: retsept bo‘yicha xomashyo sarfi'
            : `Smena: xomashyo sarfi (reja ${expectedKg.toFixed(3)} kg, haqiqiy ${actualKg.toFixed(3)} kg)`;

        await tx.inventoryMovement.create({
          data: {
            itemType: InventoryItemType.RAW_MATERIAL,
            movementType: MovementType.CONSUMPTION,
            quantity: actualKg,
            previousQuantity: balance.quantity,
            newQuantity: newQty,
            rawMaterialId: rm.id,
            createdById: params.workerId,
            referenceType: 'shift',
            referenceId: params.shiftId,
            status: EntityStatus.COMPLETED,
            note: noteBase,
          },
        });

        await this.rawMaterialBagsService.consumeFromActiveBagAfterInventoryAlreadyDeducted(
          tx,
          {
            rawMaterialId: rm.id,
            quantityKg: actualKg,
            createdById: params.workerId,
            note:
              Math.abs(deltaKg) < 1e-5
                ? 'Smena: retsept bo‘yicha xomashyo sarfi (ulangan qop)'
                : `Smena: xomashyo sarfi (ulangan qop, reja ${expectedKg.toFixed(3)} kg)`,
            referenceType: 'shift',
            referenceId: params.shiftId,
          },
        );

        await tx.shiftMaterialUsage.create({
          data: {
            shiftId: params.shiftId,
            rawMaterialId: rm.id,
            expectedKg,
            actualKg,
            deltaKg,
          },
        });
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
            note: finishedOutputNote,
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
          note: finishedOutputNote,
        },
      });
    }
  }

  private async resolvePackagingForShift(
    tx: Tx,
    params: {
      productLabel: string | null | undefined;
      packCount: number;
    },
  ): Promise<{
    producedQty: number;
    machineId: string;
    stage: ProductionStage;
  }> {
    const label = params.productLabel?.trim();
    if (!label) {
      throw new BadRequestException('Mahsulot turi tanlanishi kerak');
    }
    const packs = Math.max(0, params.packCount);
    if (packs <= 0) {
      throw new BadRequestException(
        'Pachka soni kiritilishi kerak',
      );
    }

    const finished = await tx.finishedProduct.findFirst({
      where: {
        name: { equals: label, mode: 'insensitive' },
        isDeleted: false,
      },
      include: { machineLinks: true },
    });
    if (finished) {
      const piecesPerBag =
        finished.piecesPerBag != null && finished.piecesPerBag > 0
          ? finished.piecesPerBag
          : 1;
      const producedQty = packs * piecesPerBag;
      const machineId = finished.machineLinks[0]?.machineId ?? null;
      return { producedQty, machineId, stage: ProductionStage.FINISHED };
    }

    const semi = await tx.semiProduct.findFirst({
      where: {
        name: { equals: label, mode: 'insensitive' },
        isDeleted: false,
      },
      include: { machineLinks: true },
    });
    if (semi) {
      const ppb = await this.resolvePiecesPerBagForSemiProduct(tx, semi.id);
      const producedQty = packs * ppb;
      const machineId = semi.machineLinks[0]?.machineId ?? null;
      return { producedQty, machineId, stage: ProductionStage.SEMI };
    }

    throw new BadRequestException(shiftInventoryErr('FINISHED_NOT_FOUND', label));
  }

  /** Bog‘langan tayyor mahsulotdan 1 qopdagi dona (yarim tayyor qadoqlash) */
  private async resolvePiecesPerBagForSemiProduct(
    tx: Tx,
    semiProductId: string,
  ): Promise<number> {
    const semi = await tx.semiProduct.findFirst({
      where: { id: semiProductId, isDeleted: false },
      select: { piecesPerBag: true },
    });
    if (semi?.piecesPerBag != null && semi.piecesPerBag > 0) {
      return semi.piecesPerBag;
    }
    const link = await tx.finishedProductSemiProduct.findFirst({
      where: { semiProductId },
      include: {
        finishedProduct: { select: { piecesPerBag: true, isDeleted: true } },
      },
    });
    const ppb = link?.finishedProduct?.isDeleted
      ? null
      : link?.finishedProduct?.piecesPerBag;
    return ppb != null && ppb > 0 ? ppb : 1;
  }

  /**
   * Qadoqlash: qadoqlanmagan zaxiradan qadoqlangan qismga o‘tkazish.
   * quantity (jami) o‘zgarmaydi, packagedQuantity oshadi.
   */
  private async applyShiftPackagingMarkPackaged(
    tx: Tx,
    params: {
      shiftId: string;
      workerId: string;
      itemType:
        | typeof InventoryItemType.SEMI_PRODUCT
        | typeof InventoryItemType.FINISHED_PRODUCT;
      productId: string;
      piecesToPack: number;
      productLabelForError: string;
    },
  ) {
    if (params.piecesToPack <= 0) return;

    const balance = await tx.inventoryBalance.findFirst({
      where:
        params.itemType === InventoryItemType.SEMI_PRODUCT
          ? { semiProductId: params.productId }
          : { finishedProductId: params.productId },
    });
    if (!balance) {
      throw new BadRequestException(
        params.itemType === InventoryItemType.SEMI_PRODUCT
          ? shiftInventoryErr('SEMI_BALANCE_MISSING')
          : shiftInventoryErr('FINISHED_BALANCE_MISSING'),
      );
    }

    const unpackaged = balance.quantity - balance.packagedQuantity;
    if (unpackaged + 0.0001 < params.piecesToPack) {
      throw new BadRequestException(
        shiftInventoryErr(
          'INSUFFICIENT_UNPACKAGED_STOCK',
          params.productLabelForError,
        ),
      );
    }

    const prevPackaged = balance.packagedQuantity;
    const newPackaged = prevPackaged + params.piecesToPack;

    await tx.inventoryBalance.update({
      where: { id: balance.id },
      data: { packagedQuantity: newPackaged },
    });

    const movementBase = {
      itemType: params.itemType,
      movementType: MovementType.ADJUSTMENT,
      quantity: params.piecesToPack,
      previousQuantity: prevPackaged,
      newQuantity: newPackaged,
      createdById: params.workerId,
      referenceType: 'shift',
      referenceId: params.shiftId,
      status: EntityStatus.COMPLETED,
      note: 'Smena: qadoqlash',
    };

    if (params.itemType === InventoryItemType.SEMI_PRODUCT) {
      await tx.inventoryMovement.create({
        data: { ...movementBase, semiProductId: params.productId },
      });
    } else {
      await tx.inventoryMovement.create({
        data: { ...movementBase, finishedProductId: params.productId },
      });
    }
  }

  /** Qadoqlash (tayyor): qadoqlanmagan donalarni qopga belgilash */
  private async applyShiftPackagingFinishedOutput(
    tx: Tx,
    params: {
      shiftId: string;
      workerId: string;
      productLabel: string;
      producedQty: number;
    },
  ) {
    const label = params.productLabel?.trim();
    if (!label || params.producedQty <= 0) return;

    const finished = await tx.finishedProduct.findFirst({
      where: {
        name: { equals: label, mode: 'insensitive' },
        isDeleted: false,
      },
    });

    if (!finished) {
      throw new BadRequestException(shiftInventoryErr('FINISHED_NOT_FOUND', label));
    }

    await this.applyShiftPackagingMarkPackaged(tx, {
      shiftId: params.shiftId,
      workerId: params.workerId,
      itemType: InventoryItemType.FINISHED_PRODUCT,
      productId: finished.id,
      piecesToPack: params.producedQty,
      productLabelForError: label,
    });
  }

  /** Qadoqlash (yarim tayyor): qadoqlanmagan donalarni qopga belgilash */
  private async applyShiftPackagingSemiOutput(
    tx: Tx,
    params: {
      shiftId: string;
      workerId: string;
      productLabel: string;
      producedQty: number;
    },
  ) {
    if (params.producedQty <= 0) return;

    const semi = await tx.semiProduct.findFirst({
      where: {
        name: { equals: params.productLabel.trim(), mode: 'insensitive' },
        isDeleted: false,
      },
    });
    if (!semi) {
      throw new BadRequestException(
        shiftInventoryErr('SEMI_NOT_FOUND', params.productLabel),
      );
    }

    await this.applyShiftPackagingMarkPackaged(tx, {
      shiftId: params.shiftId,
      workerId: params.workerId,
      itemType: InventoryItemType.SEMI_PRODUCT,
      productId: semi.id,
      piecesToPack: params.producedQty,
      productLabelForError: params.productLabel,
    });
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

  async createShiftRecord(dto: CreateShiftRecordDto, createdByUserId?: string) {
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

    await this.assertActiveWorkerForShiftAssignment(dto.workerId);

    const recordKind = dto.recordKind ?? ShiftRecordKind.PRODUCTION;
    if (recordKind === ShiftRecordKind.PACKAGING && wantsPaint) {
      throw new BadRequestException(
        'Qadoqlash smenasida kraska/bo‘yoq kiritilmaydi',
      );
    }

    const rawKgMap =
      recordKind === ShiftRecordKind.PACKAGING
        ? {}
        : this.normalizeRawMaterialActualKg(dto.rawMaterialActualKg);

    const created = await this.prisma.$transaction(async (tx) => {
      let machineId = dto.machineId;
      let producedQty = dto.producedQty;
      let electricityKwh = 0;
      let bagCount: number | null = null;
      let packCount: number | null = null;
      let outputNote = 'Smena: ishlab chiqarish';
      let packagingStage: ProductionStage | null = null;

      if (recordKind === ShiftRecordKind.PACKAGING) {
        const pkg = await this.resolvePackagingForShift(tx, {
          productLabel: dto.productLabel,
          packCount: dto.packCount ?? 0,
        });
        machineId = pkg.machineId;
        producedQty = pkg.producedQty;
        packagingStage = pkg.stage;
        electricityKwh = 0;
        bagCount = 0;
        packCount = dto.packCount ?? 0;
        outputNote = 'Smena: qadoqlash';
      }

      const shift = await tx.shiftRecord.create({
        data: {
          workerId: dto.workerId,
          createdById: createdByUserId ?? null,
          machineId,
          shiftNumber: dto.shiftNumber,
          date: new Date(dto.date),
          recordKind,
          hoursWorked: dto.hoursWorked,
          productLabel: dto.productLabel,
          machineReading: dto.machineReading,
          producedQty,
          defectCount: dto.defectCount ?? 0,
          bagCount,
          packCount,
          electricityKwh,
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

      if (
        recordKind === ShiftRecordKind.PACKAGING &&
        packagingStage === ProductionStage.SEMI
      ) {
        await this.applyShiftPackagingSemiOutput(tx, {
          shiftId: shift.id,
          workerId: dto.workerId,
          productLabel: dto.productLabel ?? '',
          producedQty,
        });
      } else if (
        recordKind === ShiftRecordKind.PACKAGING &&
        packagingStage === ProductionStage.FINISHED
      ) {
        await this.applyShiftPackagingFinishedOutput(tx, {
          shiftId: shift.id,
          workerId: dto.workerId,
          productLabel: dto.productLabel ?? '',
          producedQty,
        });
      } else {
        const machine = machineId
          ? await tx.machine.findUnique({ where: { id: machineId } })
          : null;

        await this.applyShiftRecipeAndOutput(tx, {
          shiftId: shift.id,
          workerId: dto.workerId,
          machine,
          productLabel: dto.productLabel,
          producedQty,
          defectCount: dto.defectCount ?? 0,
          rawMaterialActualKg: rawKgMap,
          outputNote,
        });
      }

      return tx.shiftRecord.findUniqueOrThrow({
        where: { id: shift.id },
        include: shiftRecordDetailsInclude,
      });
    });

    this.realtimeGateway.emitWarehouseUpdated({
      source: 'shift',
      shiftId: created.id,
    });

    if (created.recordKind !== ShiftRecordKind.PACKAGING) {
      await this.financeService.syncShiftElectricityExpense(created.id);
    }

    return created;
  }

  async updateShiftRecord(
    id: string,
    dto: UpdateShiftRecordDto,
    editorUserId?: string,
  ) {
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

    if (
      dto.workerId !== undefined &&
      dto.workerId !== existing.workerId
    ) {
      await this.assertActiveWorkerForShiftAssignment(dto.workerId);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const prevUsages = await tx.shiftMaterialUsage.findMany({
        where: { shiftId: id },
      });
      const preservedRawKg = Object.fromEntries(
        prevUsages.map((u) => [u.rawMaterialId, u.actualKg]),
      );

      await this.reverseShiftInventoryMovements(tx, id);

      const shift = await tx.shiftRecord.update({
        where: { id },
        data: {
          ...(existing.createdById == null && editorUserId
            ? { createdById: editorUserId }
            : {}),
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
          electricityKwh: 0,
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

      let rawMaterialActualKg = preservedRawKg;
      if (dto.rawMaterialActualKg !== undefined) {
        if (dto.rawMaterialActualKg.length === 0) {
          rawMaterialActualKg = {};
        } else {
          rawMaterialActualKg = {
            ...preservedRawKg,
            ...this.normalizeRawMaterialActualKg(dto.rawMaterialActualKg),
          };
        }
      }
      if (!machine || machine.stage !== ProductionStage.SEMI) {
        rawMaterialActualKg = {};
      }

      await this.applyShiftRecipeAndOutput(tx, {
        shiftId: shift.id,
        workerId: nextWorkerId,
        machine,
        productLabel: nextProductLabel,
        producedQty: nextProducedQty,
        defectCount: nextDefectCount,
        rawMaterialActualKg: rawMaterialActualKg,
      });

      return tx.shiftRecord.findUniqueOrThrow({
        where: { id: shift.id },
        include: shiftRecordDetailsInclude,
      });
    });

    this.realtimeGateway.emitWarehouseUpdated({
      source: 'shift',
      shiftId: updated.id,
    });

    await this.financeService.syncShiftElectricityExpense(updated.id);

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
      include: shiftRecordDetailsInclude,
      orderBy: { createdAt: 'desc' },
    });
  }
}
