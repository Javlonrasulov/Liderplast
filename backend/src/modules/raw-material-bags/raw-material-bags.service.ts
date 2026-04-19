import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Prisma } from '../../generated/prisma/client.js';
import {
  BagAuditActionType,
  BagStatus,
  EntityStatus,
  ExpenseType,
  InventoryItemType,
  MovementType,
  RawMaterialOrderStatus,
} from '../../generated/prisma/enums.js';

/** Finance seed — qop chiqimi (tashqi buyurtma emas) */
const RAW_MATERIAL_BAG_WRITEOFF_CATEGORY_ID = 'expseed_raw_material_bag_writeoff';
import { RealtimeGateway } from '../../socket/realtime.gateway.js';
import {
  ConnectBagDto,
  type ConnectBagAction,
} from './dto/connect-bag.dto.js';
import { CreateBagDto } from './dto/create-bag.dto.js';
import { ListBagsDto } from './dto/list-bags.dto.js';
import { SwitchBagDto } from './dto/switch-bag.dto.js';
import { UpdateBagDto } from './dto/update-bag.dto.js';
import { WriteoffBagDto } from './dto/writeoff-bag.dto.js';

type Tx = Prisma.TransactionClient;

/** UI/DBda ko‘rinadigan qop nomi — ichki `cuid` o‘rniga qisqa belgi */
function formatBagLabelForExpenseDescription(bagName: string, bagId: string): string {
  const t = bagName?.trim() ?? '';
  if (t && !/^c[a-z0-9_-]{12,}$/i.test(t)) {
    return t;
  }
  return `Qop №…${bagId.slice(-4)}`;
}

type ConsumeBagParams = {
  rawMaterialId: string;
  quantityKg: number;
  createdById?: string;
  consumedAt?: Date;
  note?: string;
  referenceType?: string;
  referenceId?: string;
  updateInventoryBalance?: boolean;
  createInventoryMovement?: boolean;
};

@Injectable()
export class RawMaterialBagsService implements OnModuleInit {
  private readonly logger = new Logger(RawMaterialBagsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  /** Eski yozuvlar: `BagWriteoff` bor, `Expense` yo‘q yoki bog‘lanmagan — ishga tushganda tiklash */
  async onModuleInit() {
    try {
      await this.backfillBagWriteoffExpenses();
    } catch (err: unknown) {
      this.logger.warn(`bag-writeoff expenses backfill failed: ${String(err)}`);
    }
  }

  async backfillBagWriteoffExpenses() {
    const writeoffs = await this.prisma.bagWriteoff.findMany({
      where: { expenseId: null },
      include: {
        bag: { include: { rawMaterial: { select: { id: true, name: true } } } },
      },
      orderBy: { writtenOffAt: 'asc' },
    });
    if (writeoffs.length === 0) {
      return;
    }

    let linked = 0;
    let created = 0;

    for (const w of writeoffs) {
      try {
        const bagName = w.bag.name?.trim() || w.bagId;
        const windowStart = new Date(w.writtenOffAt.getTime() - 12 * 60 * 60 * 1000);
        const windowEnd = new Date(w.writtenOffAt.getTime() + 12 * 60 * 60 * 1000);
        const kgStr = (Math.round(w.remainingQuantityKg * 1000) / 1000).toString();

        const existing = await this.prisma.expense.findFirst({
          where: {
            title: { startsWith: 'Qop chiqimi:' },
            incurredAt: { gte: windowStart, lte: windowEnd },
            AND: [
              { description: { contains: w.bag.rawMaterial.name } },
              { description: { contains: `${kgStr} kg` } },
            ],
          },
          include: { bagWriteoff: true },
          orderBy: { createdAt: 'asc' },
        });
        if (existing && !existing.bagWriteoff) {
          const taken = await this.prisma.bagWriteoff.findFirst({
            where: { expenseId: existing.id },
          });
          if (!taken) {
            await this.prisma.bagWriteoff.update({
              where: { id: w.id },
              data: { expenseId: existing.id },
            });
            linked++;
            continue;
          }
        }

        await this.prisma.$transaction(async (tx) => {
          const expense = await this.createExpenseForBagWriteoff(tx, {
            bagId: w.bagId,
            rawMaterialId: w.bag.rawMaterialId,
            rawMaterialName: w.bag.rawMaterial.name,
            bagName,
            remainingQuantityKg: w.remainingQuantityKg,
            writtenOffAt: w.writtenOffAt,
            reason: w.reason ?? undefined,
            createdById: w.createdById ?? undefined,
          });
          await tx.bagWriteoff.update({
            where: { id: w.id },
            data: { expenseId: expense.id },
          });
        });
        created++;
      } catch (err) {
        this.logger.warn(`bag-writeoff backfill skip ${w.id}: ${String(err)}`);
      }
    }

    if (linked + created > 0) {
      this.logger.log(`bag-writeoff expenses backfill: linked=${linked} created=${created}`);
    }
  }

  getBags(query: ListBagsDto) {
    return this.prisma.rawMaterialBag.findMany({
      where: {
        ...(query.rawMaterialId ? { rawMaterialId: query.rawMaterialId } : {}),
        ...(query.status ? { status: query.status } : {}),
      },
      include: {
        rawMaterial: true,
        sessions: {
          orderBy: { connectedAt: 'desc' },
          take: 5,
          include: {
            machine: true,
          },
        },
        writeoffs: {
          orderBy: { writtenOffAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  getActiveBag() {
    return this.prisma.rawMaterialBag.findFirst({
      where: { status: BagStatus.CONNECTED },
      include: {
        rawMaterial: true,
        sessions: {
          where: { isActive: true },
          orderBy: { connectedAt: 'desc' },
          take: 1,
          include: {
            machine: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  getLogs() {
    return this.prisma.bagAuditLog.findMany({
      include: {
        bag: {
          include: {
            rawMaterial: true,
          },
        },
        rawMaterial: true,
        createdBy: {
          omit: { passwordHash: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createBag(dto: CreateBagDto, createdById?: string) {
    const bag = await this.prisma.$transaction(async (tx) => {
      const rawMaterial = await tx.rawMaterial.findUnique({
        where: { id: dto.rawMaterialId },
      });
      if (!rawMaterial) {
        throw new NotFoundException('Raw material not found');
      }

      const balance = await this.getRawMaterialBalance(tx, dto.rawMaterialId);
      const allocated = await tx.rawMaterialBag.aggregate({
        _sum: { currentQuantityKg: true },
        where: { rawMaterialId: dto.rawMaterialId },
      });
      const allocatedQuantity = allocated._sum.currentQuantityKg ?? 0;
      const availableToAllocate = balance.quantity - allocatedQuantity;

      if (dto.initialQuantityKg > availableToAllocate + 0.0001) {
        throw new BadRequestException(
          'Bag quantity exceeds unallocated raw material stock',
        );
      }

      const createdBag = await tx.rawMaterialBag.create({
        data: {
          rawMaterialId: dto.rawMaterialId,
          name: dto.name?.trim() || (await this.nextAutoBagNameTx(tx, dto.rawMaterialId)),
          initialQuantityKg: dto.initialQuantityKg,
          currentQuantityKg: dto.initialQuantityKg,
          status: BagStatus.IN_STORAGE,
        },
      });

      await this.createAuditLog(tx, {
        bagId: createdBag.id,
        rawMaterialId: dto.rawMaterialId,
        actionType: BagAuditActionType.CREATED,
        quantityKg: dto.initialQuantityKg,
        note: dto.name?.trim()
          ? `Bag created: ${dto.name.trim()}`
          : 'Bag created',
        createdById,
      });

      return createdBag;
    });

    await this.emitUpdates({
      source: 'raw-material-bags',
      action: 'created',
      bagId: bag.id,
    });

    return this.getBagById(bag.id);
  }

  async updateBagName(id: string, dto: UpdateBagDto, updatedById?: string) {
    const nextName = dto.name.trim();
    if (!nextName) {
      throw new BadRequestException('Bag name is required');
    }

    const bag = await this.prisma.rawMaterialBag.findUnique({ where: { id } });
    if (!bag) {
      throw new NotFoundException('Bag not found');
    }

    await this.prisma.rawMaterialBag.update({
      where: { id },
      data: { name: nextName },
    });

    await this.emitUpdates({
      source: 'raw-material-bags',
      action: 'updated',
      bagId: id,
    });

    // Note: we intentionally skip audit log here to avoid adding new enum values/migrations.
    void updatedById;
    return this.getBagById(id);
  }

  async connectBag(dto: ConnectBagDto, createdById?: string) {
    const connectedBag = await this.prisma.$transaction(async (tx) => {
      const activeBag = await this.getActiveBagRecord(tx);
      const bag = await this.getBagForMutation(tx, dto.bagId);
      if (bag.currentQuantityKg <= 0) {
        throw new BadRequestException('Bag has no remaining quantity');
      }
      if (bag.status === BagStatus.WRITTEN_OFF) {
        throw new BadRequestException('Written off bag cannot be connected');
      }

      await this.ensureMachineExists(tx, dto.machineId);
      await this.ensureBagHasNoActiveSession(tx, bag.id);

      const connectedAt = this.resolveDate(dto.connectedAt);

      if (activeBag) {
        if (activeBag.id === bag.id) {
          throw new BadRequestException('Bag is already active');
        }

        await this.disconnectActiveBag(tx, {
          disconnectedAt: connectedAt,
          nextBagId: bag.id,
          action: dto.previousBagAction,
          reason: dto.reason,
          createdById,
        });
      }

      await tx.bagConnectionSession.create({
        data: {
          bagId: bag.id,
          machineId: dto.machineId,
          connectedAt,
          isActive: true,
        },
      });

      await tx.rawMaterialBag.update({
        where: { id: bag.id },
        data: {
          status: BagStatus.CONNECTED,
        },
      });

      await this.createAuditLog(tx, {
        bagId: bag.id,
        rawMaterialId: bag.rawMaterialId,
        actionType: BagAuditActionType.CONNECTED,
        quantityKg: bag.currentQuantityKg,
        note: activeBag ? 'Bag connected after automatic switch' : 'Bag connected to machine',
        createdById,
      });

      return bag.id;
    });

    await this.emitUpdates({
      source: 'raw-material-bags',
      action: 'connected',
      bagId: connectedBag,
    });

    return this.getBagById(connectedBag);
  }

  async switchBag(dto: SwitchBagDto, createdById?: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const activeBag = await this.getActiveBagRecord(tx);
      if (!activeBag) {
        throw new BadRequestException('No active bag to switch');
      }

      if (activeBag.id === dto.nextBagId) {
        throw new BadRequestException('Cannot switch to the same bag');
      }

      const nextBag = await this.getBagForMutation(tx, dto.nextBagId);
      if (nextBag.currentQuantityKg <= 0) {
        throw new BadRequestException('Next bag has no remaining quantity');
      }
      if (nextBag.status === BagStatus.WRITTEN_OFF) {
        throw new BadRequestException('Written off bag cannot be connected');
      }

      await this.ensureMachineExists(tx, dto.machineId);
      await this.ensureBagHasNoActiveSession(tx, nextBag.id);

      const switchedAt = this.resolveDate(dto.switchedAt);
      await this.disconnectActiveBag(tx, {
        disconnectedAt: switchedAt,
        nextBagId: nextBag.id,
        action: dto.previousBagAction,
        reason: dto.reason,
        createdById,
      });

      await tx.bagConnectionSession.create({
        data: {
          bagId: nextBag.id,
          machineId: dto.machineId,
          connectedAt: switchedAt,
          isActive: true,
        },
      });

      await tx.rawMaterialBag.update({
        where: { id: nextBag.id },
        data: {
          status: BagStatus.CONNECTED,
        },
      });

      await this.createAuditLog(tx, {
        bagId: nextBag.id,
        rawMaterialId: nextBag.rawMaterialId,
        actionType: BagAuditActionType.CONNECTED,
        quantityKg: nextBag.currentQuantityKg,
        note: 'Bag connected as replacement',
        createdById,
      });

      return {
        previousBagId: activeBag.id,
        nextBagId: nextBag.id,
      };
    });

    await this.emitUpdates({
      source: 'raw-material-bags',
      action: 'switched',
      previousBagId: result.previousBagId,
      nextBagId: result.nextBagId,
    });

    return {
      previousBag: await this.getBagById(result.previousBagId),
      nextBag: await this.getBagById(result.nextBagId),
    };
  }

  async writeoffBag(dto: WriteoffBagDto, createdById?: string) {
    const bagId = await this.prisma.$transaction(async (tx) => {
      const bag = await this.getBagForMutation(tx, dto.bagId);
      if (bag.currentQuantityKg <= 0) {
        throw new BadRequestException('Bag has no remaining quantity to write off');
      }
      if (bag.status === BagStatus.WRITTEN_OFF) {
        throw new BadRequestException('Bag already written off');
      }

      const writtenOffAt = this.resolveDate(dto.writtenOffAt);
      const activeSession = bag.sessions[0];

      if (activeSession) {
        await tx.bagConnectionSession.update({
          where: { id: activeSession.id },
          data: {
            disconnectedAt: writtenOffAt,
            isActive: false,
          },
        });

        await this.createAuditLog(tx, {
          bagId: bag.id,
          rawMaterialId: bag.rawMaterialId,
          actionType: BagAuditActionType.DISCONNECTED,
          quantityKg: bag.currentQuantityKg,
          note: 'Bag disconnected before writeoff',
          createdById,
        });
      }

      await this.applyWriteoff(tx, {
        bagId: bag.id,
        rawMaterialId: bag.rawMaterialId,
        initialQuantityKg: bag.initialQuantityKg,
        remainingQuantityKg: bag.currentQuantityKg,
        connectedAt: activeSession?.connectedAt,
        disconnectedAt: activeSession ? writtenOffAt : null,
        writtenOffAt,
        reason: dto.reason,
        createdById,
        movementNote: dto.reason?.trim()
          ? `Bag writeoff: ${dto.reason.trim()}`
          : 'Bag written off',
      });

      return bag.id;
    });

    await this.emitUpdates({
      source: 'raw-material-bags',
      action: 'written-off',
      bagId,
    });

    return this.getBagById(bagId);
  }
  // NOTE: quick-consume flow removed (consumption handled on another page)

  async consumeFromActiveBagForProduction(
    tx: Tx,
    params: ConsumeBagParams,
  ) {
    return this.consumeFromActiveBagTx(tx, {
      ...params,
      updateInventoryBalance: false,
      createInventoryMovement: false,
      referenceType: params.referenceType ?? 'production',
    });
  }

  /**
   * Smena / boshqa oqimlar: ombor qoldig‘i allaqachon yangilangan bo‘lganidan keyin.
   * Faqat hozirgi aktiv qop shu xomashyoga tegishli bo‘lsa qopdan yechiladi; aks holda hech narsa qilinmaydi.
   */
  async consumeFromActiveBagAfterInventoryAlreadyDeducted(
    tx: Tx,
    params: ConsumeBagParams,
  ): Promise<void> {
    const activeSession = await this.getActiveSession(tx);
    if (!activeSession) {
      return;
    }
    const activeBag = activeSession.bag;
    if (activeBag.rawMaterialId !== params.rawMaterialId) {
      return;
    }
    await this.consumeFromActiveBagForProduction(tx, {
      ...params,
      referenceType: params.referenceType ?? 'shift',
    });
  }

  /**
   * Smena yozuvi bekor qilinishi / tahrirlanishidan oldin: shift bo‘yicha qop audit va qoldiqni qaytarish.
   */
  async reverseBagConsumptionForShiftReference(tx: Tx, shiftId: string): Promise<void> {
    const consumed = await tx.bagAuditLog.findMany({
      where: {
        referenceType: 'shift',
        referenceId: shiftId,
        actionType: BagAuditActionType.CONSUMED,
      },
    });

    for (const log of consumed) {
      const qty = log.quantityKg ?? 0;
      if (qty <= 0) {
        continue;
      }
      const bag = await tx.rawMaterialBag.findUnique({ where: { id: log.bagId } });
      if (!bag) {
        continue;
      }
      const newQty = bag.currentQuantityKg + qty;
      let newStatus = bag.status;
      if (bag.status === BagStatus.DEPLETED && newQty > 0.0001) {
        newStatus = BagStatus.IN_STORAGE;
      }
      await tx.rawMaterialBag.update({
        where: { id: bag.id },
        data: {
          currentQuantityKg: newQty,
          status: newStatus,
        },
      });
    }

    await tx.bagAuditLog.deleteMany({
      where: {
        referenceType: 'shift',
        referenceId: shiftId,
        actionType: {
          in: [BagAuditActionType.CONSUMED, BagAuditActionType.DEPLETED],
        },
      },
    });
  }

  async createAutoBagsForIncomingTx(
    tx: Tx,
    params: {
      rawMaterialId: string;
      totalQuantityKg: number;
      createdById?: string;
      referenceType?: string;
      referenceId?: string;
    },
  ) {
    if (params.totalQuantityKg <= 0) {
      return { bagCount: 0 };
    }

    const rawMaterial = await tx.rawMaterial.findUnique({
      where: { id: params.rawMaterialId },
      select: {
        id: true,
        defaultBagWeightKg: true,
      },
    });
    if (!rawMaterial) {
      throw new NotFoundException('Raw material not found');
    }

    const bagWeightKg = rawMaterial.defaultBagWeightKg ?? 0;
    if (bagWeightKg <= 0) {
      return { bagCount: 0 };
    }

    const balance = await this.getRawMaterialBalance(tx, params.rawMaterialId);
    const allocated = await tx.rawMaterialBag.aggregate({
      _sum: { currentQuantityKg: true },
      where: { rawMaterialId: params.rawMaterialId },
    });
    const allocatedQuantity = allocated._sum.currentQuantityKg ?? 0;
    const availableToAllocate = balance.quantity - allocatedQuantity;

    if (params.totalQuantityKg > availableToAllocate + 0.0001) {
      throw new BadRequestException(
        'Auto bag quantity exceeds unallocated raw material stock',
      );
    }

    let remainingQuantityKg = params.totalQuantityKg;
    let createdCount = 0;
    const existingCount = await tx.rawMaterialBag.count({
      where: { rawMaterialId: params.rawMaterialId },
    });

    while (remainingQuantityKg > 0.0001) {
      const nextBagQuantityKg = Math.min(bagWeightKg, remainingQuantityKg);
      const autoName = this.formatAutoBagName(existingCount + createdCount + 1);
      const createdBag = await tx.rawMaterialBag.create({
        data: {
          rawMaterialId: params.rawMaterialId,
          name: autoName,
          initialQuantityKg: nextBagQuantityKg,
          currentQuantityKg: nextBagQuantityKg,
          status: BagStatus.IN_STORAGE,
        },
      });

      await this.createAuditLog(tx, {
        bagId: createdBag.id,
        rawMaterialId: params.rawMaterialId,
        actionType: BagAuditActionType.CREATED,
        quantityKg: nextBagQuantityKg,
        referenceType: params.referenceType,
        referenceId: params.referenceId,
        createdById: params.createdById,
      });

      remainingQuantityKg -= nextBagQuantityKg;
      createdCount += 1;
    }

    return {
      bagCount: createdCount,
      bagWeightKg,
    };
  }

  private formatAutoBagName(seq: number) {
    // Default label is Uzbek Cyrillic as requested
    return `Қоп-${String(seq).padStart(3, '0')}`;
  }

  private async nextAutoBagNameTx(tx: Tx, rawMaterialId: string) {
    const existingCount = await tx.rawMaterialBag.count({ where: { rawMaterialId } });
    return this.formatAutoBagName(existingCount + 1);
  }

  private async consumeFromActiveBagTx(tx: Tx, params: ConsumeBagParams) {
    if (params.quantityKg <= 0) {
      throw new BadRequestException('Consumption quantity must be greater than zero');
    }

    const activeSession = await this.getActiveSession(tx);
    if (!activeSession) {
      throw new BadRequestException('No active bag connected');
    }
    const activeBag = activeSession.bag;

    if (
      params.rawMaterialId &&
      activeBag.rawMaterialId !== params.rawMaterialId
    ) {
      throw new BadRequestException('Active bag raw material does not match consumption');
    }

    if (activeBag.currentQuantityKg + 0.0001 < params.quantityKg) {
      throw new BadRequestException('Active bag quantity is insufficient');
    }

    const balance = await this.getRawMaterialBalance(tx, activeBag.rawMaterialId);
    if (
      params.updateInventoryBalance &&
      balance.quantity + 0.0001 < params.quantityKg
    ) {
      throw new BadRequestException('Raw material stock is insufficient');
    }

    const consumedAt = params.consumedAt ?? new Date();
    const nextBagQuantity = Math.max(0, activeBag.currentQuantityKg - params.quantityKg);
    const nextBalanceQuantity = params.updateInventoryBalance
      ? balance.quantity - params.quantityKg
      : balance.quantity;
    const nextStatus =
      nextBagQuantity <= 0.0001 ? BagStatus.DEPLETED : BagStatus.CONNECTED;

    await tx.rawMaterialBag.update({
      where: { id: activeBag.id },
      data: {
        currentQuantityKg: nextBagQuantity,
        status: nextStatus,
      },
    });

    if (params.updateInventoryBalance) {
      await tx.inventoryBalance.update({
        where: { id: balance.id },
        data: {
          quantity: nextBalanceQuantity,
          status: EntityStatus.COMPLETED,
        },
      });
    }

    if (params.createInventoryMovement) {
      await tx.inventoryMovement.create({
        data: {
          itemType: InventoryItemType.RAW_MATERIAL,
          movementType: MovementType.CONSUMPTION,
          quantity: params.quantityKg,
          previousQuantity: balance.quantity,
          newQuantity: nextBalanceQuantity,
          note: params.note ?? 'Quick bag consumption',
          createdById: params.createdById,
          rawMaterialId: activeBag.rawMaterialId,
          status: EntityStatus.COMPLETED,
          referenceType: params.referenceType,
          referenceId: params.referenceId,
        },
      });
    }

    await this.createAuditLog(tx, {
      bagId: activeBag.id,
      rawMaterialId: activeBag.rawMaterialId,
      actionType: BagAuditActionType.CONSUMED,
      quantityKg: params.quantityKg,
      note: params.note ?? 'Material consumed from active bag',
      createdById: params.createdById,
      referenceType: params.referenceType,
      referenceId: params.referenceId,
      metadata: {
        remainingQuantityKg: nextBagQuantity,
      },
    });

    if (nextStatus === BagStatus.DEPLETED) {
      await this.closeActiveSession(tx, activeSession.id, consumedAt);

      await this.createAuditLog(tx, {
        bagId: activeBag.id,
        rawMaterialId: activeBag.rawMaterialId,
        actionType: BagAuditActionType.DEPLETED,
        quantityKg: 0,
        note: 'Bag depleted',
        createdById: params.createdById,
        referenceType: params.referenceType,
        referenceId: params.referenceId,
      });
    }

    return {
      bagId: activeBag.id,
      sessionId: activeSession.id,
      remainingQuantityKg: nextBagQuantity,
      status: nextStatus,
    };
  }

  private async disconnectActiveBag(
    tx: Tx,
    params: {
      disconnectedAt: Date;
      nextBagId: string;
      action?: ConnectBagAction | 'RETURN_TO_STORAGE' | 'WRITE_OFF';
      reason?: string;
      createdById?: string;
    },
  ) {
    const activeSession = await this.getActiveSession(tx);
    if (!activeSession) {
      return;
    }

    const activeBag = activeSession.bag;

    if (activeBag.currentQuantityKg > 0 && !params.action) {
      throw new BadRequestException(
        'Previous active bag has remaining quantity. Choose return to warehouse or writeoff.',
      );
    }

    await this.closeActiveSession(tx, activeSession.id, params.disconnectedAt);

    await this.createAuditLog(tx, {
      bagId: activeBag.id,
      rawMaterialId: activeBag.rawMaterialId,
      actionType: BagAuditActionType.DISCONNECTED,
      quantityKg: activeBag.currentQuantityKg,
      note: params.reason?.trim()
        ? `Bag disconnected: ${params.reason.trim()}`
        : 'Bag disconnected',
      createdById: params.createdById,
      metadata: {
        nextBagId: params.nextBagId,
      },
    });

    if (activeBag.currentQuantityKg <= 0.0001) {
      await tx.rawMaterialBag.update({
        where: { id: activeBag.id },
        data: {
          status: BagStatus.DEPLETED,
        },
      });
      return;
    }

    if (params.action === 'WRITE_OFF') {
      await this.applyWriteoff(tx, {
        bagId: activeBag.id,
        rawMaterialId: activeBag.rawMaterialId,
        initialQuantityKg: activeBag.initialQuantityKg,
        remainingQuantityKg: activeBag.currentQuantityKg,
        connectedAt: activeSession.connectedAt,
        disconnectedAt: params.disconnectedAt,
        writtenOffAt: params.disconnectedAt,
        reason: params.reason,
        createdById: params.createdById,
        movementNote: params.reason?.trim()
          ? `Bag writeoff: ${params.reason.trim()}`
          : 'Bag written off after disconnect',
      });
      return;
    }

    await tx.rawMaterialBag.update({
      where: { id: activeBag.id },
      data: {
        status: BagStatus.IN_STORAGE,
      },
    });

    await this.createAuditLog(tx, {
      bagId: activeBag.id,
      rawMaterialId: activeBag.rawMaterialId,
      actionType: BagAuditActionType.RETURNED_TO_STORAGE,
      quantityKg: activeBag.currentQuantityKg,
      note: 'Bag returned to warehouse after disconnect',
      createdById: params.createdById,
      metadata: {
        nextBagId: params.nextBagId,
      },
    });
  }

  /**
   * So‘mdagi kg narxi — avvalo oxirgi etib kelgan buyurtma, bo‘lmasa
   * shu xom ashyo bo‘yicha oxirgi kiritilgan (hali PENDING) tashqi buyurtma.
   */
  private async resolvePurchaseCostPerKgUzs(
    tx: Tx,
    rawMaterialId: string,
  ): Promise<{ perKg: number | null; source: 'fulfilled' | 'pending' | null }> {
    const fulfilled = await tx.rawMaterialPurchaseOrder.findFirst({
      where: {
        rawMaterialId,
        status: RawMaterialOrderStatus.FULFILLED,
        quantityKg: { gt: 0 },
        amountUzs: { gt: 0 },
      },
      orderBy: [{ fulfilledAt: 'desc' }, { orderedAt: 'desc' }],
    });
    if (fulfilled) {
      const perKg = fulfilled.amountUzs / fulfilled.quantityKg;
      if (Number.isFinite(perKg) && perKg > 0) {
        return { perKg, source: 'fulfilled' };
      }
    }
    const pending = await tx.rawMaterialPurchaseOrder.findFirst({
      where: {
        rawMaterialId,
        status: RawMaterialOrderStatus.PENDING,
        quantityKg: { gt: 0 },
        amountUzs: { gt: 0 },
      },
      orderBy: { orderedAt: 'desc' },
    });
    if (pending) {
      const perKg = pending.amountUzs / pending.quantityKg;
      if (Number.isFinite(perKg) && perKg > 0) {
        return { perKg, source: 'pending' };
      }
    }
    return { perKg: null, source: null };
  }

  private async createExpenseForBagWriteoff(
    tx: Tx,
    params: {
      bagId: string;
      rawMaterialId: string;
      rawMaterialName: string;
      bagName: string;
      remainingQuantityKg: number;
      writtenOffAt: Date;
      reason?: string;
      createdById?: string;
    },
  ): Promise<{ id: string }> {
    const category = await tx.expenseCategory.findFirst({
      where: { id: RAW_MATERIAL_BAG_WRITEOFF_CATEGORY_ID, deletedAt: null },
    });
    const { perKg: costPerKg, source: costSource } = await this.resolvePurchaseCostPerKgUzs(
      tx,
      params.rawMaterialId,
    );
    const amountUzs =
      costPerKg != null
        ? Math.round(costPerKg * params.remainingQuantityKg * 100) / 100
        : 0;

    const kgStr = (Math.round(params.remainingQuantityKg * 1000) / 1000).toString();
    const bagLine = formatBagLabelForExpenseDescription(params.bagName, params.bagId);
    const costHint =
      costPerKg != null
        ? costSource === 'fulfilled'
          ? `Kg narxi: ${(Math.round(costPerKg * 100) / 100).toString()} so'm (oxirgi etib kelgan buyurtma bo'yicha)`
          : `Kg narxi: ${(Math.round(costPerKg * 100) / 100).toString()} so'm (tashqi buyurtma, hali omborga kelmagan)`
        : "Tashqi buyurtma bo'yicha kg narxi topilmadi — 0 so'm";
    const descParts = [
      `${params.rawMaterialName} — ${kgStr} kg chiqim`,
      `Qop: ${bagLine}`,
      costHint,
      params.reason?.trim() ? `Sabab: ${params.reason.trim()}` : null,
    ].filter(Boolean) as string[];

    return tx.expense.create({
      data: {
        title: `Qop chiqimi: ${params.rawMaterialName}`,
        type: category?.legacyExpenseType ?? ExpenseType.OTHER,
        categoryId: category?.id ?? null,
        amount: amountUzs,
        description: descParts.join(' · '),
        incurredAt: params.writtenOffAt,
        status: EntityStatus.COMPLETED,
        createdById: params.createdById ?? null,
      },
      select: { id: true },
    });
  }

  private async applyWriteoff(
    tx: Tx,
    params: {
      bagId: string;
      rawMaterialId: string;
      initialQuantityKg: number;
      remainingQuantityKg: number;
      connectedAt?: Date | null;
      disconnectedAt?: Date | null;
      writtenOffAt: Date;
      reason?: string;
      createdById?: string;
      movementNote: string;
    },
  ) {
    const bagMeta = await tx.rawMaterialBag.findUnique({
      where: { id: params.bagId },
      include: { rawMaterial: { select: { name: true } } },
    });
    if (!bagMeta) {
      throw new NotFoundException('Bag not found');
    }

    const balance = await this.getRawMaterialBalance(tx, params.rawMaterialId);
    if (balance.quantity + 0.0001 < params.remainingQuantityKg) {
      throw new BadRequestException('Raw material stock is insufficient for writeoff');
    }

    const nextBalanceQuantity = balance.quantity - params.remainingQuantityKg;

    await tx.inventoryBalance.update({
      where: { id: balance.id },
      data: {
        quantity: nextBalanceQuantity,
        status: EntityStatus.COMPLETED,
      },
    });

    await tx.inventoryMovement.create({
      data: {
        itemType: InventoryItemType.RAW_MATERIAL,
        movementType: MovementType.ADJUSTMENT,
        quantity: params.remainingQuantityKg,
        previousQuantity: balance.quantity,
        newQuantity: nextBalanceQuantity,
        note: params.movementNote,
        createdById: params.createdById,
        rawMaterialId: params.rawMaterialId,
        status: EntityStatus.COMPLETED,
        referenceType: 'bag-writeoff',
        referenceId: params.bagId,
      },
    });

    await tx.rawMaterialBag.update({
      where: { id: params.bagId },
      data: {
        currentQuantityKg: 0,
        status: BagStatus.WRITTEN_OFF,
      },
    });

    const writeoff = await tx.bagWriteoff.create({
      data: {
        bagId: params.bagId,
        initialQuantityKg: params.initialQuantityKg,
        remainingQuantityKg: params.remainingQuantityKg,
        connectedAt: params.connectedAt ?? null,
        disconnectedAt: params.disconnectedAt ?? null,
        writtenOffAt: params.writtenOffAt,
        reason: params.reason?.trim() || null,
        createdById: params.createdById,
      },
    });

    const expense = await this.createExpenseForBagWriteoff(tx, {
      bagId: params.bagId,
      rawMaterialId: params.rawMaterialId,
      rawMaterialName: bagMeta.rawMaterial.name,
      bagName: bagMeta.name?.trim() || params.bagId,
      remainingQuantityKg: params.remainingQuantityKg,
      writtenOffAt: params.writtenOffAt,
      reason: params.reason,
      createdById: params.createdById,
    });

    await tx.bagWriteoff.update({
      where: { id: writeoff.id },
      data: { expenseId: expense.id },
    });

    await this.createAuditLog(tx, {
      bagId: params.bagId,
      rawMaterialId: params.rawMaterialId,
      actionType: BagAuditActionType.WRITTEN_OFF,
      quantityKg: params.remainingQuantityKg,
      note: params.reason?.trim()
        ? `Bag written off: ${params.reason.trim()}`
        : 'Bag written off',
      createdById: params.createdById,
      referenceType: 'bag-writeoff',
      referenceId: params.bagId,
    });
  }

  private async ensureMachineExists(tx: Tx, machineId?: string) {
    if (!machineId) {
      return;
    }

    const machine = await tx.machine.findUnique({
      where: { id: machineId },
    });
    if (!machine) {
      throw new NotFoundException('Machine not found');
    }
  }

  private async ensureBagHasNoActiveSession(tx: Tx, bagId: string) {
    const activeSession = await tx.bagConnectionSession.findFirst({
      where: {
        bagId,
        isActive: true,
      },
    });

    if (activeSession) {
      throw new BadRequestException('Bag is already connected');
    }
  }

  private async getRawMaterialBalance(tx: Tx, rawMaterialId: string) {
    const balance = await tx.inventoryBalance.findFirst({
      where: { rawMaterialId },
    });
    if (!balance) {
      throw new NotFoundException('Raw material balance not found');
    }
    return balance;
  }

  private getBagById(id: string) {
    return this.prisma.rawMaterialBag.findUnique({
      where: { id },
      include: {
        rawMaterial: true,
        sessions: {
          orderBy: { connectedAt: 'desc' },
          include: {
            machine: true,
          },
        },
        writeoffs: {
          orderBy: { writtenOffAt: 'desc' },
        },
      },
    });
  }

  private getBagForMutation(tx: Tx, bagId: string) {
    return tx.rawMaterialBag.findUnique({
      where: { id: bagId },
      include: {
        rawMaterial: true,
        sessions: {
          where: { isActive: true },
          orderBy: { connectedAt: 'desc' },
          take: 1,
        },
      },
    }).then((bag) => {
      if (!bag) {
        throw new NotFoundException('Bag not found');
      }
      return bag;
    });
  }

  private async getActiveSession(tx: Tx) {
    return tx.bagConnectionSession.findFirst({
      where: { isActive: true },
      include: {
        bag: {
          include: {
            rawMaterial: true,
            sessions: {
              where: { isActive: true },
              orderBy: { connectedAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { connectedAt: 'desc' },
    });
  }

  private async getActiveBagRecord(tx: Tx) {
    const activeSession = await this.getActiveSession(tx);
    return activeSession?.bag ?? null;
  }

  private async closeActiveSession(
    tx: Tx,
    sessionId: string,
    disconnectedAt: Date,
  ) {
    await tx.bagConnectionSession.update({
      where: { id: sessionId },
      data: {
        isActive: false,
        disconnectedAt,
      },
    });
  }

  private createAuditLog(
    tx: Tx,
    params: {
      bagId: string;
      rawMaterialId: string;
      actionType: BagAuditActionType;
      quantityKg?: number;
      note?: string;
      metadata?: Prisma.InputJsonValue;
      referenceType?: string;
      referenceId?: string;
      createdById?: string;
    },
  ) {
    return tx.bagAuditLog.create({
      data: {
        bagId: params.bagId,
        rawMaterialId: params.rawMaterialId,
        actionType: params.actionType,
        quantityKg: params.quantityKg,
        note: params.note,
        metadata: params.metadata,
        referenceType: params.referenceType,
        referenceId: params.referenceId,
        createdById: params.createdById,
      },
    });
  }

  private resolveDate(value?: string) {
    return value ? new Date(value) : new Date();
  }

  private async emitUpdates(payload: Record<string, unknown>) {
    this.realtimeGateway.emitWarehouseUpdated(payload);
    this.realtimeGateway.emitRawMaterialBagsUpdated(payload);
  }
}
