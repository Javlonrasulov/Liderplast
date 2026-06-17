import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client.js';
import { KassaEntryType } from '../../generated/prisma/enums.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateKassaInflowDto } from './dto/create-kassa-inflow.dto.js';
import { CreateKassaOutflowDto } from './dto/create-kassa-outflow.dto.js';
import { UpdateKassaInflowDto } from './dto/update-kassa-inflow.dto.js';
import { UpdateKassaOutflowDto } from './dto/update-kassa-outflow.dto.js';

type Tx = Prisma.TransactionClient;

const kassaInclude = {
  client: { select: { id: true, name: true } },
  order: { select: { id: true } },
  createdBy: { omit: { passwordHash: true } },
  updatedBy: { omit: { passwordHash: true } },
} as const;

function parseEntryDate(value?: string): Date {
  if (!value?.trim()) {
    return new Date();
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return new Date(`${value.trim()}T12:00:00+05:00`);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException('Invalid entry date');
  }
  return parsed;
}

function isClientRemoved(client: { phone: string }): boolean {
  return client.phone.includes('__del__');
}

@Injectable()
export class KassaService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertClientActive(tx: Tx, clientId: string) {
    const client = await tx.client.findUnique({ where: { id: clientId } });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    if (isClientRemoved(client)) {
      throw new BadRequestException('Client has been removed');
    }
    return client;
  }

  private async computeSummary(tx: Tx = this.prisma) {
    const grouped = await tx.kassaEntry.groupBy({
      by: ['type'],
      _sum: { amount: true },
    });
    const inflow =
      grouped.find((row) => row.type === KassaEntryType.CLIENT_INFLOW)?._sum.amount ?? 0;
    const outflow =
      grouped.find((row) => row.type === KassaEntryType.OUTFLOW)?._sum.amount ?? 0;
    const saleDeductions =
      grouped.find((row) => row.type === KassaEntryType.SALE_DEDUCTION)?._sum.amount ?? 0;
    const balance = inflow - outflow;
    return { balance, totalInflow: inflow, totalOutflow: outflow, totalSaleDeductions: saleDeductions };
  }

  async getSummary() {
    return this.computeSummary();
  }

  getEntries() {
    return this.prisma.kassaEntry.findMany({
      include: kassaInclude,
      orderBy: [{ entryDate: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createInflow(dto: CreateKassaInflowDto, createdById?: string) {
    const entryDate = parseEntryDate(dto.entryDate);

    return this.prisma.$transaction(async (tx) => {
      await this.assertClientActive(tx, dto.clientId);

      const entry = await tx.kassaEntry.create({
        data: {
          type: KassaEntryType.CLIENT_INFLOW,
          clientId: dto.clientId,
          amount: dto.amount,
          comment: dto.comment?.trim() || null,
          entryDate,
          createdById,
        },
        include: kassaInclude,
      });

      await tx.client.update({
        where: { id: dto.clientId },
        data: { cashBalance: { increment: dto.amount } },
      });

      return entry;
    });
  }

  async updateInflow(id: string, dto: UpdateKassaInflowDto, updatedById?: string) {
    const existing = await this.prisma.kassaEntry.findUnique({ where: { id } });
    if (!existing || existing.type !== KassaEntryType.CLIENT_INFLOW) {
      throw new NotFoundException('Kassa inflow not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const nextClientId = dto.clientId ?? existing.clientId;
      if (!nextClientId) {
        throw new BadRequestException('Client is required');
      }
      await this.assertClientActive(tx, nextClientId);

      const nextAmount = dto.amount ?? existing.amount;
      const oldClientId = existing.clientId;
      const oldAmount = existing.amount;

      if (oldClientId && oldClientId !== nextClientId) {
        const oldClient = await tx.client.findUnique({ where: { id: oldClientId } });
        if (oldClient && oldClient.cashBalance < oldAmount) {
          throw new BadRequestException('Eski mijoz hisobida yetarli mablag‘ yo‘q');
        }
        await tx.client.update({
          where: { id: oldClientId },
          data: { cashBalance: { decrement: oldAmount } },
        });
        await tx.client.update({
          where: { id: nextClientId },
          data: { cashBalance: { increment: nextAmount } },
        });
      } else if (oldClientId) {
        const delta = nextAmount - oldAmount;
        if (delta < 0) {
          const client = await tx.client.findUnique({ where: { id: oldClientId } });
          if (!client || client.cashBalance + delta < -0.01) {
            throw new BadRequestException('Mijoz hisobida yetarli mablag‘ yo‘q');
          }
        }
        await tx.client.update({
          where: { id: oldClientId },
          data: { cashBalance: { increment: delta } },
        });
      }

      return tx.kassaEntry.update({
        where: { id },
        data: {
          clientId: nextClientId,
          amount: nextAmount,
          comment: dto.comment !== undefined ? dto.comment.trim() || null : undefined,
          entryDate: dto.entryDate ? parseEntryDate(dto.entryDate) : undefined,
          updatedById,
        },
        include: kassaInclude,
      });
    });
  }

  async deleteInflow(id: string) {
    const existing = await this.prisma.kassaEntry.findUnique({ where: { id } });
    if (!existing || existing.type !== KassaEntryType.CLIENT_INFLOW) {
      throw new NotFoundException('Kassa inflow not found');
    }
    if (!existing.clientId) {
      throw new BadRequestException('Invalid inflow record');
    }

    return this.prisma.$transaction(async (tx) => {
      const client = await tx.client.findUnique({ where: { id: existing.clientId! } });
      if (!client || client.cashBalance < existing.amount) {
        throw new BadRequestException(
          'Mijoz hisobida yetarli mablag‘ yo‘q — avval sotuvlarni tekshiring',
        );
      }

      await tx.client.update({
        where: { id: existing.clientId! },
        data: { cashBalance: { decrement: existing.amount } },
      });

      await tx.kassaEntry.delete({ where: { id } });
      return { success: true };
    });
  }

  async createOutflow(dto: CreateKassaOutflowDto, createdById?: string) {
    const entryDate = parseEntryDate(dto.entryDate);
    const summary = await this.computeSummary();
    if (summary.balance < dto.amount) {
      throw new BadRequestException('Kassa hisobida yetarli mablag‘ yo‘q');
    }

    return this.prisma.kassaEntry.create({
      data: {
        type: KassaEntryType.OUTFLOW,
        amount: dto.amount,
        comment: dto.comment?.trim() || null,
        entryDate,
        createdById,
      },
      include: kassaInclude,
    });
  }

  async updateOutflow(id: string, dto: UpdateKassaOutflowDto, updatedById?: string) {
    const existing = await this.prisma.kassaEntry.findUnique({ where: { id } });
    if (!existing || existing.type !== KassaEntryType.OUTFLOW) {
      throw new NotFoundException('Kassa outflow not found');
    }

    const nextAmount = dto.amount ?? existing.amount;
    const summary = await this.computeSummary();
    const balanceAfterRestore = summary.balance + existing.amount;
    if (balanceAfterRestore < nextAmount) {
      throw new BadRequestException('Kassa hisobida yetarli mablag‘ yo‘q');
    }

    return this.prisma.kassaEntry.update({
      where: { id },
      data: {
        amount: nextAmount,
        comment: dto.comment !== undefined ? dto.comment.trim() || null : undefined,
        entryDate: dto.entryDate ? parseEntryDate(dto.entryDate) : undefined,
        updatedById,
      },
      include: kassaInclude,
    });
  }

  async deleteOutflow(id: string) {
    const existing = await this.prisma.kassaEntry.findUnique({ where: { id } });
    if (!existing || existing.type !== KassaEntryType.OUTFLOW) {
      throw new NotFoundException('Kassa outflow not found');
    }

    await this.prisma.kassaEntry.delete({ where: { id } });
    return { success: true };
  }

  /** Sotuvda mijoz oldindan to‘langan hisobidan yechish */
  async applySaleBalanceDeduction(
    tx: Tx,
    params: {
      clientId: string;
      orderId: string;
      totalAmount: number;
      paidAmount: number;
      createdById?: string;
    },
  ) {
    const client = await tx.client.findUnique({ where: { id: params.clientId } });
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const balanceToApply = Math.min(client.cashBalance, params.totalAmount);
    const remainingAfterBalance = params.totalAmount - balanceToApply;
    if (params.paidAmount > remainingAfterBalance + 0.01) {
      throw new BadRequestException('To‘langan summa buyurtma summasidan oshib ketdi');
    }
    const effectivePaid = params.paidAmount + balanceToApply;
    const debtAmount = Math.max(params.totalAmount - effectivePaid, 0);

    if (balanceToApply > 0) {
      await tx.client.update({
        where: { id: params.clientId },
        data: { cashBalance: { decrement: balanceToApply } },
      });

      await tx.kassaEntry.create({
        data: {
          type: KassaEntryType.SALE_DEDUCTION,
          clientId: params.clientId,
          orderId: params.orderId,
          amount: balanceToApply,
          comment: 'Sotuv — mijoz hisobidan',
          createdById: params.createdById,
        },
      });
    }

    return { balanceApplied: balanceToApply, effectivePaid, debtAmount };
  }

  async reverseSaleBalanceDeduction(tx: Tx, orderId: string) {
    const entries = await tx.kassaEntry.findMany({
      where: { orderId, type: KassaEntryType.SALE_DEDUCTION },
    });

    for (const entry of entries) {
      if (entry.clientId) {
        await tx.client.update({
          where: { id: entry.clientId },
          data: { cashBalance: { increment: entry.amount } },
        });
      }
      await tx.kassaEntry.delete({ where: { id: entry.id } });
    }
  }
}
