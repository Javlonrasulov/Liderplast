import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { InventoryDocumentStatus } from '../../generated/prisma/enums.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateInventoryDocumentDto } from './dto/create-inventory-document.dto.js';
import { ListInventoryDocumentsDto } from './dto/list-inventory-documents.dto.js';
import { UpdateInventoryDocumentDto } from './dto/update-inventory-document.dto.js';

@Injectable()
export class InventoryDocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListInventoryDocumentsDto) {
    const where: Prisma.InventoryDocumentWhereInput = {};

    if (query.warehouseId?.trim()) {
      where.warehouseId = query.warehouseId.trim();
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.docNumber?.trim()) {
      where.docNumber = {
        contains: query.docNumber.trim(),
        mode: 'insensitive',
      };
    }
    if (query.dateFrom?.trim()) {
      where.dateTo = { gte: query.dateFrom.trim() };
    }
    if (query.dateTo?.trim()) {
      where.dateFrom = { lte: query.dateTo.trim() };
    }

    const rows = await this.prisma.inventoryDocument.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
    });
    return rows.map((row) => this.serialize(row));
  }

  async getById(id: string) {
    const row = await this.prisma.inventoryDocument.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Inventory document not found');
    return this.serialize(row);
  }

  async nextDocNumber() {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;
    const rows = await this.prisma.inventoryDocument.findMany({
      where: { docNumber: { startsWith: prefix } },
      select: { docNumber: true },
    });
    const indexes = rows
      .map((r) => parseInt(r.docNumber.slice(prefix.length), 10))
      .filter((n) => Number.isFinite(n));
    const next = (indexes.length === 0 ? 0 : Math.max(...indexes)) + 1;
    return { docNumber: `${prefix}${String(next).padStart(3, '0')}` };
  }

  async create(dto: CreateInventoryDocumentDto, createdById?: string) {
    const docNumber =
      dto.docNumber?.trim() || (await this.nextDocNumber()).docNumber;

    const existing = await this.prisma.inventoryDocument.findUnique({
      where: { docNumber },
    });
    if (existing) {
      throw new BadRequestException('Document number already exists');
    }

    const row = await this.prisma.inventoryDocument.create({
      data: {
        docNumber,
        warehouseId: dto.warehouseId,
        warehouseName: dto.warehouseName,
        dateFrom: dto.dateFrom,
        dateTo: dto.dateTo,
        status: dto.status ?? InventoryDocumentStatus.NOT_STARTED,
        expenseIds: dto.expenseIds ?? [],
        rows: dto.rows as unknown as Prisma.InputJsonValue,
        finishedAt: dto.finishedAt ? new Date(dto.finishedAt) : undefined,
        createdById,
      },
    });
    return this.serialize(row);
  }

  async update(id: string, dto: UpdateInventoryDocumentDto) {
    const existing = await this.prisma.inventoryDocument.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Inventory document not found');

    if (existing.status === InventoryDocumentStatus.COMPLETED) {
      const allowedKeys = new Set(['expenseIds']);
      const keys = Object.keys(dto).filter(
        (k) => dto[k as keyof UpdateInventoryDocumentDto] !== undefined,
      );
      const onlyExpenseIds =
        keys.length > 0 && keys.every((k) => allowedKeys.has(k));
      if (!onlyExpenseIds) {
        throw new BadRequestException(
          'Tugallangan inventarizatsiyani faqat xarajat bog‘lanishini yangilash mumkin',
        );
      }
    }

    const finishedAt =
      dto.finishedAt === null
        ? null
        : dto.finishedAt
          ? new Date(dto.finishedAt)
          : undefined;

    const row = await this.prisma.inventoryDocument.update({
      where: { id },
      data: {
        warehouseId: dto.warehouseId,
        warehouseName: dto.warehouseName,
        dateFrom: dto.dateFrom,
        dateTo: dto.dateTo,
        status: dto.status,
        expenseIds: dto.expenseIds,
        rows:
          dto.rows !== undefined
            ? (dto.rows as unknown as Prisma.InputJsonValue)
            : undefined,
        finishedAt,
      },
    });
    return this.serialize(row);
  }

  async remove(id: string) {
    const existing = await this.prisma.inventoryDocument.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Inventory document not found');
    await this.prisma.inventoryDocument.delete({ where: { id } });
    return { success: true };
  }

  private serialize(row: {
    id: string;
    docNumber: string;
    warehouseId: string;
    warehouseName: string;
    dateFrom: string;
    dateTo: string;
    status: InventoryDocumentStatus;
    expenseIds: string[];
    rows: unknown;
    createdAt: Date;
    updatedAt: Date;
    finishedAt: Date | null;
  }) {
    return {
      id: row.id,
      docNumber: row.docNumber,
      warehouseId: row.warehouseId,
      warehouseName: row.warehouseName,
      dateFrom: row.dateFrom,
      dateTo: row.dateTo,
      status: row.status,
      expenseIds: row.expenseIds ?? [],
      rows: row.rows,
      createdAt: row.createdAt.toISOString(),
      finishedAt: row.finishedAt?.toISOString(),
    };
  }
}
