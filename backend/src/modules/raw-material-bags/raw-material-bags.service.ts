import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Prisma } from '../../generated/prisma/client.js';
import {
  BagAuditActionType,
  BagStatus,
  EntityStatus,
  InventoryItemType,
  MovementType,
} from '../../generated/prisma/enums.js';
import { RealtimeGateway } from '../../socket/realtime.gateway.js';
import {
  ConnectBagDto,
  type ConnectBagAction,
} from './dto/connect-bag.dto.js';
import { CreateBagDto } from './dto/create-bag.dto.js';
import { ListBagsDto } from './dto/list-bags.dto.js';
import { QuickConsumeDto } from './dto/quick-consume.dto.js';
import { SwitchBagDto } from './dto/switch-bag.dto.js';
import { WriteoffBagDto } from './dto/writeoff-bag.dto.js';

type Tx = Prisma.TransactionClient;

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
export class RawMaterialBagsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

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
          name: dto.name?.trim() || null,
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

  async quickConsume(dto: QuickConsumeDto, createdById?: string) {
    const quantityKg = this.resolveConsumptionQuantity(dto);
    const result = await this.prisma.$transaction(async (tx) =>
      this.consumeFromActiveBagTx(tx, {
        rawMaterialId: dto.rawMaterialId ?? '',
        quantityKg,
        createdById,
        consumedAt: this.resolveDate(dto.consumedAt),
        note: dto.note,
        referenceType: dto.referenceType ?? 'quick-consume',
        referenceId: dto.referenceId,
        updateInventoryBalance: true,
        createInventoryMovement: true,
      }),
    );

    await this.emitUpdates({
      source: 'raw-material-bags',
      action: 'consumed',
      bagId: result.bagId,
      quantityKg,
    });

    return {
      bag: await this.getBagById(result.bagId),
      consumedQuantityKg: quantityKg,
      remainingQuantityKg: result.remainingQuantityKg,
    };
  }

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

    while (remainingQuantityKg > 0.0001) {
      const nextBagQuantityKg = Math.min(bagWeightKg, remainingQuantityKg);
      const createdBag = await tx.rawMaterialBag.create({
        data: {
          rawMaterialId: params.rawMaterialId,
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

    await tx.bagWriteoff.create({
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

  private resolveConsumptionQuantity(dto: QuickConsumeDto) {
    if (dto.quantityKg !== undefined) {
      return dto.quantityKg;
    }

    if (dto.pieceCount === undefined || dto.gramPerUnit === undefined) {
      throw new BadRequestException(
        'Provide either quantityKg or both pieceCount and gramPerUnit',
      );
    }

    return (dto.pieceCount * dto.gramPerUnit) / 1000;
  }

  private async emitUpdates(payload: Record<string, unknown>) {
    this.realtimeGateway.emitWarehouseUpdated(payload);
    this.realtimeGateway.emitRawMaterialBagsUpdated(payload);
  }
}
