import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  CompanyAssetActionType,
  CompanyAssetCategory,
  CompanyAssetCondition,
  CompanyAssetStatus,
  ExpenseType,
  PurchaseOrderCurrency,
} from '../../generated/prisma/enums.js';
import { CreateCompanyAssetDto } from './dto/create-company-asset.dto.js';
import { UpdateCompanyAssetDto } from './dto/update-company-asset.dto.js';
import { ListCompanyAssetsDto } from './dto/list-company-assets.dto.js';
import { BulkCompanyAssetsDto } from './dto/bulk-company-assets.dto.js';

const COMPANY_ASSET_EXPENSE_CATEGORY_ID = 'expseed_company_assets';
const COMPANY_ASSET_EXPENSE_CATEGORY_NAME = 'Korxona mulki';

const activeOnly = { isDeleted: false };

const assetInclude = {
  assignedUser: { omit: { passwordHash: true } as const },
  createdBy: { omit: { passwordHash: true } as const },
  updatedBy: { omit: { passwordHash: true } as const },
  deletedBy: { omit: { passwordHash: true } as const },
  expense: { include: { category: true } },
  documents: { orderBy: { uploadedAt: 'desc' as const } },
  activityLogs: {
    orderBy: { performedAt: 'desc' as const },
    include: {
      performedBy: { omit: { passwordHash: true } as const },
    },
  },
};

@Injectable()
export class CompanyAssetsService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureCompanyAssetExpenseCategory() {
    const row = await this.prisma.expenseCategory.findUnique({
      where: { id: COMPANY_ASSET_EXPENSE_CATEGORY_ID },
    });
    if (row && row.deletedAt == null) return row;
    if (row?.deletedAt) {
      return this.prisma.expenseCategory.update({
        where: { id: COMPANY_ASSET_EXPENSE_CATEGORY_ID },
        data: { deletedAt: null },
      });
    }
    return this.prisma.expenseCategory.create({
      data: {
        id: COMPANY_ASSET_EXPENSE_CATEGORY_ID,
        name: COMPANY_ASSET_EXPENSE_CATEGORY_NAME,
        legacyExpenseType: ExpenseType.OTHER,
        electricityCalc: false,
      },
    });
  }

  private categoryLabel(category: string): string {
    const map: Record<string, string> = {
      TRANSPORT: 'Transport vositalari',
      OFFICE_EQUIPMENT: 'Ofis jihozlari',
      COMPUTER_TECH: 'Kompyuter texnikasi',
      PRODUCTION_EQUIPMENT: 'Ishlab chiqarish uskunalari',
      TECH_APPARATUS: 'Texnologik apparatlar',
      FURNITURE: 'Mebel',
      OTHER: 'Boshqa',
    };
    return map[category] ?? category;
  }

  private statusLabel(status: CompanyAssetStatus): string {
    const map: Record<CompanyAssetStatus, string> = {
      ACTIVE: 'Faol',
      NEEDS_REPAIR: 'Tamir talab',
      UNDER_REPAIR: 'Tuzatiladi',
      WRITTEN_OFF: 'Hisobdan chiqarilgan',
    };
    return map[status] ?? status;
  }

  private parseStatusList(raw?: string): CompanyAssetStatus[] {
    if (!raw?.trim()) return [];
    const allowed = new Set(Object.values(CompanyAssetStatus));
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter((s): s is CompanyAssetStatus =>
        allowed.has(s as CompanyAssetStatus),
      );
  }

  private computeAmountUzs(
    currency: PurchaseOrderCurrency,
    amountOriginal: number,
    fxRateToUzs: number,
  ): number {
    let fx = fxRateToUzs;
    if (currency === PurchaseOrderCurrency.UZS) {
      fx = 1;
    }
    if (!Number.isFinite(fx) || fx <= 0) {
      throw new BadRequestException('Invalid exchange rate');
    }
    const amountUzs =
      currency === PurchaseOrderCurrency.UZS
        ? amountOriginal
        : amountOriginal * fx;
    if (!Number.isFinite(amountUzs) || amountUzs < 0) {
      throw new BadRequestException('Invalid purchase amount');
    }
    return amountUzs;
  }

  private async nextInventoryNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `KM-${year}-`;
    const latest = await this.prisma.companyAsset.findFirst({
      where: { inventoryNumber: { startsWith: prefix } },
      orderBy: { inventoryNumber: 'desc' },
      select: { inventoryNumber: true },
    });
    let seq = 1;
    if (latest?.inventoryNumber.startsWith(prefix)) {
      const parsed = Number.parseInt(latest.inventoryNumber.slice(prefix.length), 10);
      if (Number.isFinite(parsed) && parsed > 0) seq = parsed + 1;
    }
    return `${prefix}${String(seq).padStart(5, '0')}`;
  }

  private requireActor(userId?: string): string {
    if (!userId?.trim()) {
      throw new BadRequestException('Authenticated user required');
    }
    return userId;
  }

  private async actorFullName(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true },
    });
    if (!user) throw new BadRequestException('User not found');
    return user.fullName;
  }

  /** Tarixda foydalanuvchi o‘chirilsa ham kim qilgani saqlansin */
  private actionDetails(message: string, actorName: string): string {
    return `${message} · Kim: ${actorName}`;
  }

  private buildExpenseDescription(params: {
    name: string;
    inventoryNumber: string;
    category: string;
    currency: PurchaseOrderCurrency;
    amountOriginal: number;
    fx: number;
    amountUzs: number;
    purchasedAt: Date;
    manufacturer?: string | null;
    model?: string | null;
    serialNumber?: string | null;
  }): string {
    const dateStr = params.purchasedAt.toISOString().slice(0, 10);
    return [
      `Inventar: ${params.inventoryNumber}`,
      `Kategoriya: ${this.categoryLabel(params.category)}`,
      params.manufacturer ? `Ishlab chiqaruvchi: ${params.manufacturer}` : null,
      params.model ? `Model: ${params.model}` : null,
      params.serialNumber ? `Seriya: ${params.serialNumber}` : null,
      `Xarid sanasi: ${dateStr}`,
      `${params.currency} ${params.amountOriginal}`,
      `kurs ${params.fx}`,
      `→ ${Math.round(params.amountUzs)} UZS`,
    ]
      .filter(Boolean)
      .join(' · ');
  }

  async getStats() {
    const [total, active, writtenOff, valueAgg] = await Promise.all([
      this.prisma.companyAsset.count({ where: activeOnly }),
      this.prisma.companyAsset.count({
        where: { ...activeOnly, status: CompanyAssetStatus.ACTIVE },
      }),
      this.prisma.companyAsset.count({
        where: { ...activeOnly, status: CompanyAssetStatus.WRITTEN_OFF },
      }),
      this.prisma.companyAsset.aggregate({
        where: {
          ...activeOnly,
          status: {
            in: [
              CompanyAssetStatus.ACTIVE,
              CompanyAssetStatus.NEEDS_REPAIR,
              CompanyAssetStatus.UNDER_REPAIR,
            ],
          },
        },
        _sum: { initialValueUzs: true },
      }),
    ]);
    return {
      total,
      active,
      writtenOff,
      totalValueUzs: valueAgg._sum.initialValueUzs ?? 0,
    };
  }

  async list(dto: ListCompanyAssetsDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

    const and: object[] = [{ ...activeOnly }];

    if (dto.search?.trim()) {
      const q = dto.search.trim();
      and.push({
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { manufacturer: { contains: q, mode: 'insensitive' } },
          { model: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    if (dto.inventorySearch?.trim()) {
      and.push({
        inventoryNumber: {
          contains: dto.inventorySearch.trim(),
          mode: 'insensitive',
        },
      });
    }

    const statusList = this.parseStatusList(dto.statuses);
    if (statusList.length > 0) {
      and.push({ status: { in: statusList } });
    } else if (dto.status) {
      and.push({ status: dto.status });
    }
    if (dto.category) and.push({ category: dto.category });
    if (dto.location?.trim()) {
      and.push({
        location: { contains: dto.location.trim(), mode: 'insensitive' },
      });
    }
    if (dto.assignedUserId) {
      and.push({ assignedUserId: dto.assignedUserId });
    }

    const where = and.length > 0 ? { AND: and } : {};

    const [items, total] = await Promise.all([
      this.prisma.companyAsset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          assignedUser: { omit: { passwordHash: true } },
        },
      }),
      this.prisma.companyAsset.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async getById(id: string) {
    const asset = await this.prisma.companyAsset.findUnique({
      where: { id },
      include: assetInclude,
    });
    if (!asset || asset.isDeleted) throw new NotFoundException('Asset not found');
    return asset;
  }

  async create(dto: CreateCompanyAssetDto, createdById?: string) {
    const actorId = this.requireActor(createdById);
    const actorName = await this.actorFullName(actorId);

    const inventoryNumber =
      dto.inventoryNumber?.trim() || (await this.nextInventoryNumber());

    const existing = await this.prisma.companyAsset.findFirst({
      where: { inventoryNumber, isDeleted: false },
    });
    if (existing) {
      throw new BadRequestException('Inventory number already exists');
    }

    let fx = dto.fxRateToUzs ?? 1;
    if (dto.currency === PurchaseOrderCurrency.UZS) fx = 1;

    const amountUzs = this.computeAmountUzs(
      dto.currency,
      dto.purchasePriceOriginal,
      fx,
    );

    const assetCategory = dto.category ?? CompanyAssetCategory.OTHER;
    const expenseCategory = await this.ensureCompanyAssetExpenseCategory();
    const purchasedAt = dto.purchasedAt ? new Date(dto.purchasedAt) : new Date();
    const warrantyUntil = dto.warrantyUntil
      ? new Date(dto.warrantyUntil)
      : undefined;

    let assignedUserName: string | null = null;
    if (dto.assignedUserId) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.assignedUserId },
      });
      if (!user) throw new BadRequestException('Assigned user not found');
      assignedUserName = user.fullName;
    }

    return this.prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          title: `Korxona mulki: ${dto.name.trim()}`,
          type: expenseCategory.legacyExpenseType,
          categoryId: expenseCategory.id,
          amount: amountUzs,
          description: this.buildExpenseDescription({
            name: dto.name.trim(),
            inventoryNumber,
            category: assetCategory,
            currency: dto.currency,
            amountOriginal: dto.purchasePriceOriginal,
            fx,
            amountUzs,
            purchasedAt,
            manufacturer: dto.manufacturer,
            model: dto.model,
            serialNumber: dto.serialNumber,
          }),
          incurredAt: purchasedAt,
          createdById: actorId,
        },
      });

      const asset = await tx.companyAsset.create({
        data: {
          inventoryNumber,
          name: dto.name.trim(),
          serialNumber: dto.serialNumber?.trim() || null,
          category: assetCategory,
          manufacturer: dto.manufacturer?.trim() || null,
          model: dto.model?.trim() || null,
          purchasedAt,
          purchasePriceOriginal: dto.purchasePriceOriginal,
          currency: dto.currency,
          fxRateToUzs: fx,
          initialValueUzs: amountUzs,
          warrantyUntil,
          assignedUserId: dto.assignedUserId || null,
          location: dto.location?.trim() || null,
          condition: dto.condition ?? CompanyAssetCondition.GOOD,
          status: dto.status ?? CompanyAssetStatus.ACTIVE,
          imageUrl: dto.imageUrl?.trim() || null,
          notes: dto.notes?.trim() || null,
          expenseId: expense.id,
          createdById: actorId,
          updatedById: actorId,
          documents: dto.documents?.length
            ? {
                create: dto.documents.map((d) => ({
                  fileName: d.fileName,
                  fileUrl: d.fileUrl,
                })),
              }
            : undefined,
        },
        include: assetInclude,
      });

      await tx.companyAssetActivityLog.create({
        data: {
          assetId: asset.id,
          actionType: CompanyAssetActionType.CREATED,
          details: this.actionDetails(`Mulk qo'shildi: ${asset.name}`, actorName),
          performedById: actorId,
        },
      });

      if (dto.assignedUserId && assignedUserName) {
        await tx.companyAssetActivityLog.create({
          data: {
            assetId: asset.id,
            actionType: CompanyAssetActionType.ASSIGNED,
            details: this.actionDetails(
              `Xodimga biriktirildi: ${assignedUserName}`,
              actorName,
            ),
            performedById: actorId,
          },
        });
      }

      return asset;
    });
  }

  async update(
    id: string,
    dto: UpdateCompanyAssetDto,
    performedById?: string,
  ) {
    const actorId = this.requireActor(performedById);
    const actorName = await this.actorFullName(actorId);

    const prev = await this.prisma.companyAsset.findUnique({
      where: { id },
      include: { assignedUser: true },
    });
    if (!prev || prev.isDeleted) throw new NotFoundException('Asset not found');

    let newAssignedUserName: string | null = null;
    if (dto.assignedUserId) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.assignedUserId },
      });
      if (!user) throw new BadRequestException('Assigned user not found');
      newAssignedUserName = user.fullName;
    }

    const warrantyUntil =
      dto.warrantyUntil !== undefined
        ? dto.warrantyUntil
          ? new Date(dto.warrantyUntil)
          : null
        : undefined;

    const asset = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.companyAsset.update({
        where: { id },
        data: {
          name: dto.name?.trim(),
          serialNumber:
            dto.serialNumber !== undefined
              ? dto.serialNumber?.trim() || null
              : undefined,
          category: dto.category,
          manufacturer:
            dto.manufacturer !== undefined
              ? dto.manufacturer?.trim() || null
              : undefined,
          model:
            dto.model !== undefined ? dto.model?.trim() || null : undefined,
          purchasedAt: dto.purchasedAt ? new Date(dto.purchasedAt) : undefined,
          warrantyUntil,
          assignedUserId:
            dto.assignedUserId !== undefined ? dto.assignedUserId : undefined,
          location:
            dto.location !== undefined
              ? dto.location?.trim() || null
              : undefined,
          condition: dto.condition,
          status: dto.status,
          imageUrl:
            dto.imageUrl !== undefined ? dto.imageUrl?.trim() || null : undefined,
          notes:
            dto.notes !== undefined ? dto.notes?.trim() || null : undefined,
          updatedById: actorId,
        },
        include: assetInclude,
      });

      if (dto.documents?.length) {
        await tx.companyAssetDocument.createMany({
          data: dto.documents.map((d) => ({
            assetId: id,
            fileName: d.fileName,
            fileUrl: d.fileUrl,
          })),
        });
      }

      await tx.companyAssetActivityLog.create({
        data: {
          assetId: id,
          actionType: CompanyAssetActionType.UPDATED,
          details: this.actionDetails('Ma\'lumotlar tahrirlandi', actorName),
          performedById: actorId,
        },
      });

      if (
        dto.assignedUserId !== undefined &&
        dto.assignedUserId !== prev.assignedUserId
      ) {
        const prevName = prev.assignedUser?.fullName ?? null;
        if (dto.assignedUserId && newAssignedUserName) {
          const message =
            prevName != null
              ? `Xodim o'zgartirildi: ${prevName} → ${newAssignedUserName}`
              : `Xodimga biriktirildi: ${newAssignedUserName}`;
          await tx.companyAssetActivityLog.create({
            data: {
              assetId: id,
              actionType: CompanyAssetActionType.ASSIGNED,
              details: this.actionDetails(message, actorName),
              performedById: actorId,
            },
          });
        } else if (prevName) {
          await tx.companyAssetActivityLog.create({
            data: {
              assetId: id,
              actionType: CompanyAssetActionType.RETURNED,
              details: this.actionDetails(
                `Xodimdan qaytarib olindi: ${prevName}`,
                actorName,
              ),
              performedById: actorId,
            },
          });
        }
      }

      if (dto.status && dto.status !== prev.status) {
        let actionType: CompanyAssetActionType = CompanyAssetActionType.UPDATED;
        let message = `Status: ${this.statusLabel(dto.status)}`;
        if (dto.status === CompanyAssetStatus.WRITTEN_OFF) {
          actionType = CompanyAssetActionType.WRITTEN_OFF;
          message = 'Hisobdan chiqarildi';
        } else if (
          dto.status === CompanyAssetStatus.NEEDS_REPAIR ||
          dto.status === CompanyAssetStatus.UNDER_REPAIR
        ) {
          actionType = CompanyAssetActionType.SENT_TO_REPAIR;
          message = this.statusLabel(dto.status);
        }
        await tx.companyAssetActivityLog.create({
          data: {
            assetId: id,
            actionType,
            details: this.actionDetails(message, actorName),
            performedById: actorId,
          },
        });
      }

      return tx.companyAsset.findUnique({
        where: { id },
        include: assetInclude,
      });
    });

    return asset;
  }

  async bulkUpdateStatus(
    dto: BulkCompanyAssetsDto,
    performedById?: string,
  ) {
    const actorId = this.requireActor(performedById);
    const actorName = await this.actorFullName(actorId);

    const assets = await this.prisma.companyAsset.findMany({
      where: { id: { in: dto.ids }, ...activeOnly },
    });
    if (assets.length !== dto.ids.length) {
      throw new BadRequestException('Some assets not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.companyAsset.updateMany({
        where: { id: { in: dto.ids } },
        data: { status: dto.status, updatedById: actorId },
      });

      for (const asset of assets) {
        if (asset.status === dto.status) continue;
        let actionType: CompanyAssetActionType = CompanyAssetActionType.UPDATED;
        let message = `Status: ${this.statusLabel(dto.status)}`;
        if (dto.status === CompanyAssetStatus.WRITTEN_OFF) {
          actionType = CompanyAssetActionType.WRITTEN_OFF;
          message = 'Hisobdan chiqarildi';
        } else if (
          dto.status === CompanyAssetStatus.NEEDS_REPAIR ||
          dto.status === CompanyAssetStatus.UNDER_REPAIR
        ) {
          actionType = CompanyAssetActionType.SENT_TO_REPAIR;
          message = this.statusLabel(dto.status);
        }
        await tx.companyAssetActivityLog.create({
          data: {
            assetId: asset.id,
            actionType,
            details: this.actionDetails(message, actorName),
            performedById: actorId,
          },
        });
      }
    });

    return { updated: dto.ids.length };
  }

  async remove(id: string, performedById?: string) {
    const actorId = this.requireActor(performedById);
    const actorName = await this.actorFullName(actorId);

    const asset = await this.prisma.companyAsset.findUnique({ where: { id } });
    if (!asset || asset.isDeleted) {
      throw new NotFoundException('Asset not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.companyAssetActivityLog.create({
        data: {
          assetId: id,
          actionType: CompanyAssetActionType.DELETED,
          details: this.actionDetails(`O'chirildi: ${asset.name}`, actorName),
          performedById: actorId,
        },
      });

      await tx.companyAsset.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedById: actorId,
        },
      });
    });

    return { ok: true };
  }

  async listFilterOptions() {
    const [locations, users] = await Promise.all([
      this.prisma.companyAsset.findMany({
        where: { ...activeOnly, location: { not: null } },
        select: { location: true },
        distinct: ['location'],
      }),
      this.prisma.user.findMany({
        where: { isActive: true },
        select: { id: true, fullName: true },
        orderBy: { fullName: 'asc' },
      }),
    ]);
    return {
      locations: locations
        .map((r) => r.location)
        .filter((l): l is string => !!l?.trim())
        .sort((a, b) => a.localeCompare(b)),
      employees: users.map((u) => ({ id: u.id, fullName: u.fullName })),
    };
  }
}
