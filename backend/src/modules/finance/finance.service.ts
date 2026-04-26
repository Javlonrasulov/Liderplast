import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  BankTransactionType,
  BankVedomostStatus,
  EmployeeRateType,
  EntityStatus,
  ExpenseType,
  PurchaseOrderCurrency,
  RawMaterialOrderStatus,
  Role,
  SalaryType,
} from '../../generated/prisma/enums.js';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto.js';
import { CreateRawMaterialPurchaseOrderDto } from './dto/create-raw-material-purchase-order.dto.js';
import { CreateExpenseDto } from './dto/create-expense.dto.js';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto.js';
import { GenerateSalaryDto } from './dto/generate-salary.dto.js';
import { SetMonthPaidDto } from './dto/set-month-paid.dto.js';
import { UpsertEmployeeProductRateDto } from './dto/upsert-employee-product-rate.dto.js';
import { UpdateSalarySettingsDto } from './dto/update-salary-settings.dto.js';
import { UpdateSalaryRecordDto } from './dto/update-salary-record.dto.js';

const SALARY_PURPOSE_KEYWORDS = ['oylik', 'ish haqi', 'zarplata', 'salary'];

const RAW_MATERIAL_ORDER_CATEGORY_ID = 'expseed_raw_material_orders';
const ELECTRICITY_EXPENSE_CATEGORY_SEED_ID = 'expseed_electricity';

type ParsedBankRow = {
  documentDate: Date | null;
  documentNumber: string | null;
  operationDate: Date | null;
  debit: number;
  credit: number;
  receiverName: string | null;
  receiverAccount: string | null;
  receiverBankName: string | null;
  receiverStir: string | null;
  paymentPurpose: string | null;
};

type EmployeeMatchResult = {
  employee: { id: string; fullName: string; stir: string | null } | null;
  isSalaryCandidate: boolean;
  unresolved: boolean;
};

type ClientMatchResult = {
  client: {
    id: string;
    name: string;
    bankAccount: string | null;
    bankName: string | null;
  } | null;
  unresolved: boolean;
};

type LightweightClient = {
  id: string;
  name: string;
  bankAccount: string | null;
  bankName: string | null;
};

function normalizeText(value?: string | null) {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9а-яёўқғҳ\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeDigits(value?: string | null) {
  const digits = value?.replace(/\D/g, '') ?? '';
  return digits || null;
}

function parseAmount(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  const cleaned = String(value ?? '')
    .replace(/\s+/g, '')
    .replace(/,/g, '.')
    .replace(/[^\d.-]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDateValue(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      return new Date(
        Date.UTC(
          parsed.y,
          Math.max(0, parsed.m - 1),
          parsed.d,
          parsed.H ?? 0,
          parsed.M ?? 0,
          parsed.S ?? 0,
        ),
      );
    }
  }

  const raw = String(value ?? '').trim();
  if (!raw) {
    return null;
  }

  const direct = new Date(raw);
  if (!Number.isNaN(direct.getTime())) {
    return direct;
  }

  const normalized = raw.replace(/[./]/g, '-');
  const parts = normalized.split('-').map((item) => item.trim());
  if (parts.length === 3) {
    const [left, middle, right] = parts;
    if (left.length === 4) {
      const date = new Date(`${left}-${middle}-${right}T00:00:00.000Z`);
      if (!Number.isNaN(date.getTime())) {
        return date;
      }
    }
    const date = new Date(`${right}-${middle}-${left}T00:00:00.000Z`);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}

function isEmptyRow(row: Record<string, unknown>) {
  return Object.values(row).every((value) => `${value ?? ''}`.trim() === '');
}

function getFieldValue(row: Record<string, unknown>, aliases: string[]) {
  const entries = Object.entries(row).map(([key, value]) => [normalizeText(key), value] as const);

  for (const alias of aliases.map((item) => normalizeText(item))) {
    const exact = entries.find(([key]) => key === alias);
    if (exact) {
      return exact[1];
    }
  }

  for (const alias of aliases.map((item) => normalizeText(item))) {
    const fuzzy = entries.find(([key]) => key.includes(alias) || alias.includes(key));
    if (fuzzy) {
      return fuzzy[1];
    }
  }

  return null;
}

function getMonthRange(month: string) {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new BadRequestException('Invalid month format. Expected YYYY-MM');
  }
  const [yearRaw, monthRaw] = month.split('-');
  const year = Number(yearRaw);
  const monthIndex = Number(monthRaw) - 1;
  const start = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0, 0));
  return { start, end };
}

function monthFromDate(date: Date) {
  return date.toISOString().slice(0, 7);
}

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Smena elektr xarajati uchun kategoriya. Bazada yo‘q yoki barchasi soft-delete
   * bo‘lsa, migratsiyadagi seed id bilan yaratiladi yoki tiklanadi (aks holda sync jim chiqib ketardi).
   */
  private async getElectricityExpenseCategoryForSync() {
    let category = await this.prisma.expenseCategory.findFirst({
      where: {
        deletedAt: null,
        OR: [{ electricityCalc: true }, { legacyExpenseType: 'ELECTRICITY' }],
      },
      orderBy: { createdAt: 'asc' },
    });
    if (category) return category;

    const seed = await this.prisma.expenseCategory.findUnique({
      where: { id: ELECTRICITY_EXPENSE_CATEGORY_SEED_ID },
    });
    if (seed?.deletedAt != null) {
      category = await this.prisma.expenseCategory.update({
        where: { id: ELECTRICITY_EXPENSE_CATEGORY_SEED_ID },
        data: {
          deletedAt: null,
          electricityCalc: true,
          legacyExpenseType: ExpenseType.ELECTRICITY,
        },
      });
      this.logger.warn(
        `Restored soft-deleted electricity expense category ${ELECTRICITY_EXPENSE_CATEGORY_SEED_ID}`,
      );
      return category;
    }
    if (seed) {
      if (!seed.electricityCalc || seed.legacyExpenseType !== ExpenseType.ELECTRICITY) {
        category = await this.prisma.expenseCategory.update({
          where: { id: ELECTRICITY_EXPENSE_CATEGORY_SEED_ID },
          data: { electricityCalc: true, legacyExpenseType: ExpenseType.ELECTRICITY },
        });
        this.logger.warn(
          `Repaired electricity flags on category ${ELECTRICITY_EXPENSE_CATEGORY_SEED_ID}`,
        );
        return category;
      }
      return seed;
    }

    try {
      category = await this.prisma.expenseCategory.create({
        data: {
          id: ELECTRICITY_EXPENSE_CATEGORY_SEED_ID,
          name: 'Elektr energiya',
          legacyExpenseType: ExpenseType.ELECTRICITY,
          electricityCalc: true,
        },
      });
      this.logger.warn(
        `Created missing electricity expense category ${ELECTRICITY_EXPENSE_CATEGORY_SEED_ID}`,
      );
      return category;
    } catch (err) {
      category = await this.prisma.expenseCategory.findFirst({
        where: {
          deletedAt: null,
          OR: [{ electricityCalc: true }, { legacyExpenseType: 'ELECTRICITY' }],
        },
        orderBy: { createdAt: 'asc' },
      });
      if (category) return category;
      this.logger.error(
        `Electricity expense category missing and create failed: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      return null;
    }
  }

  private async syncClientBankInfo(
    client: LightweightClient | null,
    row: Pick<ParsedBankRow, 'receiverAccount' | 'receiverBankName'>,
  ) {
    if (!client) {
      return;
    }

    const nextBankAccount =
      !normalizeDigits(client.bankAccount) && normalizeDigits(row.receiverAccount)
        ? row.receiverAccount?.trim() || null
        : null;
    const nextBankName =
      !client.bankName?.trim() && row.receiverBankName?.trim()
        ? row.receiverBankName.trim()
        : null;

    if (!nextBankAccount && !nextBankName) {
      return;
    }

    await this.prisma.client.update({
      where: { id: client.id },
      data: {
        ...(nextBankAccount ? { bankAccount: nextBankAccount } : {}),
        ...(nextBankName ? { bankName: nextBankName } : {}),
      },
    });

    client.bankAccount = client.bankAccount ?? nextBankAccount;
    client.bankName = client.bankName ?? nextBankName;
  }

  async createExpense(dto: CreateExpenseDto, createdById?: string) {
    const category = await this.prisma.expenseCategory.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category || category.deletedAt) {
      throw new BadRequestException('Expense category not found or inactive');
    }

    const incurredAt = dto.incurredAt ? new Date(dto.incurredAt) : new Date();

    return this.prisma.expense.create({
      data: {
        title: dto.title,
        type: category.legacyExpenseType,
        categoryId: category.id,
        amount: dto.amount,
        description: dto.description,
        incurredAt,
        createdById,
      },
      include: {
        category: true,
        createdBy: {
          omit: { passwordHash: true },
        },
      },
    });
  }

  getExpenses() {
    return this.prisma.expense.findMany({
      include: {
        category: true,
        createdBy: {
          omit: { passwordHash: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRawMaterialPurchaseOrder(
    dto: CreateRawMaterialPurchaseOrderDto,
    createdById?: string,
  ) {
    const rm = await this.prisma.rawMaterial.findFirst({
      where: { id: dto.rawMaterialId, isDeleted: false },
    });
    if (!rm) {
      throw new BadRequestException('Raw material not found');
    }

    const category = await this.prisma.expenseCategory.findFirst({
      where: { id: RAW_MATERIAL_ORDER_CATEGORY_ID, deletedAt: null },
    });
    if (!category) {
      throw new BadRequestException(
        'Expense category for raw material orders is missing (run migrations).',
      );
    }

    let fx = dto.fxRateToUzs;
    if (dto.currency === PurchaseOrderCurrency.UZS) {
      fx = 1;
    }
    if (!Number.isFinite(fx) || fx <= 0) {
      throw new BadRequestException('Invalid CBU / exchange rate');
    }

    const amountUzs =
      dto.currency === PurchaseOrderCurrency.UZS
        ? dto.amountOriginal
        : dto.amountOriginal * fx;

    if (!Number.isFinite(amountUzs) || amountUzs < 0) {
      throw new BadRequestException('Invalid amounts');
    }

    return this.prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          title: `Buyurtma: ${rm.name}`,
          type: category.legacyExpenseType,
          categoryId: category.id,
          amount: amountUzs,
          description: [
            `${dto.quantityKg} kg`,
            `${dto.currency} ${dto.amountOriginal}`,
            `kurs ${fx}`,
            `→ ${Math.round(amountUzs)} UZS`,
            dto.notes?.trim(),
          ]
            .filter(Boolean)
            .join(' · '),
          incurredAt: new Date(),
          createdById,
        },
      });

      return tx.rawMaterialPurchaseOrder.create({
        data: {
          rawMaterialId: rm.id,
          quantityKg: dto.quantityKg,
          currency: dto.currency,
          fxRateToUzs: fx,
          amountOriginal: dto.amountOriginal,
          amountUzs,
          expenseId: expense.id,
          notes: dto.notes?.trim() || null,
          createdById: createdById ?? null,
        },
        include: {
          rawMaterial: { select: { id: true, name: true } },
          expense: {
            select: { id: true, amount: true, title: true, incurredAt: true },
          },
        },
      });
    });
  }

  getRawMaterialPurchaseOrders() {
    return this.prisma.rawMaterialPurchaseOrder.findMany({
      orderBy: [{ orderedAt: 'desc' }],
      include: {
        rawMaterial: { select: { id: true, name: true } },
        expense: {
          select: { id: true, amount: true, title: true, incurredAt: true },
        },
      },
    });
  }

  async fulfillRawMaterialPurchaseOrder(id: string) {
    const row = await this.prisma.rawMaterialPurchaseOrder.findUnique({
      where: { id },
    });
    if (!row) {
      throw new NotFoundException('Purchase order not found');
    }
    if (row.status !== RawMaterialOrderStatus.PENDING) {
      throw new BadRequestException('Order is not pending');
    }
    return this.prisma.rawMaterialPurchaseOrder.update({
      where: { id },
      data: {
        status: RawMaterialOrderStatus.FULFILLED,
        fulfilledAt: new Date(),
      },
      include: {
        rawMaterial: { select: { id: true, name: true } },
        expense: {
          select: { id: true, amount: true, title: true, incurredAt: true },
        },
      },
    });
  }

  async getExpenseCategories() {
    await this.prisma.expenseCategory.updateMany({
      where: { legacyExpenseType: 'ELECTRICITY', electricityCalc: false },
      data: { electricityCalc: true },
    });
    return this.prisma.expenseCategory.findMany({
      where: { deletedAt: null },
      orderBy: [{ name: 'asc' }],
    });
  }

  createExpenseCategory(dto: CreateExpenseCategoryDto) {
    return this.prisma.expenseCategory.create({
      data: {
        name: dto.name.trim(),
        legacyExpenseType: 'OTHER',
        electricityCalc: false,
      },
    });
  }

  async updateExpenseCategory(id: string, dto: UpdateExpenseCategoryDto) {
    const existing = await this.prisma.expenseCategory.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Expense category not found');
    }
    if (dto.name === undefined) {
      return existing;
    }
    return this.prisma.expenseCategory.update({
      where: { id },
      data: { name: dto.name.trim() },
    });
  }

  async deleteExpenseCategory(id: string) {
    const existing = await this.prisma.expenseCategory.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Expense category not found');
    }
    if (existing.deletedAt) {
      return existing;
    }
    if (existing.electricityCalc || existing.legacyExpenseType === 'ELECTRICITY') {
      throw new BadRequestException(
        'Electricity calculation category cannot be removed. You can rename it.',
      );
    }
    return this.prisma.expenseCategory.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Smena yozuvidagi kVt·soat × bazadagi narx bo‘yicha elektr kategoriyasiga xarajat
   * (bir smenaga bitta bog‘langan Expense, `sourceShiftId`).
   *
   * Agar smenada kVt·soat kiritilmagan bo‘lsa, lekin `hoursWorked` va apparat `powerKw`
   * bo‘lsa, taxminiy sarfiyat: soat × kVt (ish vaqtida nominal quvvat ishlatilgan deb).
   */
  async syncShiftElectricityExpense(shiftId: string) {
    const shift = await this.prisma.shiftRecord.findUnique({
      where: { id: shiftId },
      include: { worker: true, machine: true },
    });
    if (!shift) {
      return;
    }

    const settings = await this.prisma.salarySetting.findFirst();
    const pricePerKwh = settings?.electricityPricePerKwh ?? 800;

    const category = await this.getElectricityExpenseCategoryForSync();
    if (!category) {
      return;
    }

    const enteredKwh = Number(shift.electricityKwh) || 0;
    const hours = Number(shift.hoursWorked) || 0;
    const powerKw = Number(shift.machine?.powerKw) || 0;
    const impliedKwh = Math.max(0, hours * powerKw);
    const kwh = enteredKwh > 1e-6 ? enteredKwh : impliedKwh;

    const existing = await this.prisma.expense.findFirst({
      where: { sourceShiftId: shiftId },
    });

    if (kwh <= 1e-6) {
      if (existing) {
        await this.prisma.expense.delete({ where: { id: existing.id } });
      }
      return;
    }

    const amount = Math.round(kwh * pricePerKwh * 100) / 100;
    const workerName = shift.worker?.fullName?.trim() || '—';
    const machineName = shift.machine?.name ?? '—';
    const dateStr = shift.date.toISOString().slice(0, 10);
    const kwhSource =
      enteredKwh > 1e-6
        ? `${kwh} kVt·soat`
        : `${kwh.toFixed(2)} kVt·soat (${hours} soat × ${powerKw} kVt)`;
    const description = `Smena → elektr: ${dateStr}, ${shift.shiftNumber}-smena — ${workerName}; ${machineName} — ${kwhSource} × ${pricePerKwh} so'm`;
    const title = description.length >= 2 ? description.slice(0, 160) : 'Smena elektr';

    const common = {
      title,
      type: category.legacyExpenseType,
      categoryId: category.id,
      amount,
      description,
      incurredAt: shift.date,
      status: EntityStatus.COMPLETED,
    };

    if (existing) {
      await this.prisma.expense.update({
        where: { id: existing.id },
        data: common,
      });
    } else {
      await this.prisma.expense.create({
        data: {
          ...common,
          sourceShiftId: shiftId,
        },
      });
    }
  }

  async resyncAllShiftElectricityExpenses() {
    const shifts = await this.prisma.shiftRecord.findMany({
      where: {
        OR: [
          { electricityKwh: { gt: 0 } },
          {
            hoursWorked: { gt: 0 },
            machine: { powerKw: { gt: 0 } },
          },
        ],
      },
      select: { id: true },
    });
    for (const row of shifts) {
      await this.syncShiftElectricityExpense(row.id);
    }
  }

  getEmployeeProductRates() {
    return this.prisma.employeeProductRate.findMany({
      orderBy: [{ workerId: 'asc' }, { productLabel: 'asc' }],
    });
  }

  upsertEmployeeProductRate(dto: UpsertEmployeeProductRateDto) {
    return this.prisma.employeeProductRate.upsert({
      where: {
        workerId_productLabel: {
          workerId: dto.workerId,
          productLabel: dto.productLabel,
        },
      },
      update: {
        rateType: dto.rateType,
        rateValue: dto.rateValue,
        baseAmount: dto.rateType === EmployeeRateType.PERCENT ? dto.baseAmount ?? 0 : null,
      },
      create: {
        workerId: dto.workerId,
        productLabel: dto.productLabel,
        rateType: dto.rateType,
        rateValue: dto.rateValue,
        baseAmount: dto.rateType === EmployeeRateType.PERCENT ? dto.baseAmount ?? 0 : null,
      },
    });
  }

  async deleteEmployeeProductRate(workerId: string, productLabel: string) {
    const existing = await this.prisma.employeeProductRate.findUnique({
      where: {
        workerId_productLabel: {
          workerId,
          productLabel,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Employee product rate not found');
    }

    await this.prisma.employeeProductRate.delete({
      where: {
        workerId_productLabel: {
          workerId,
          productLabel,
        },
      },
    });

    return { success: true };
  }

  async updateSalarySettings(dto: UpdateSalarySettingsDto) {
    const existing = await this.prisma.salarySetting.findFirst();

    const data = {
      incomeTaxPercent: dto.incomeTaxPercent,
      otherDeductionPercent: dto.otherDeductionPercent,
      socialTaxPercent: dto.socialTaxPercent,
      npsPercent: dto.npsPercent,
      ...(dto.electricityPricePerKwh !== undefined
        ? { electricityPricePerKwh: dto.electricityPricePerKwh }
        : {}),
    };

    if (!existing) {
      return this.prisma.salarySetting.create({
        data: {
          ...data,
          electricityPricePerKwh: dto.electricityPricePerKwh ?? 800,
        },
      });
    }

    const updated = await this.prisma.salarySetting.update({
      where: { id: existing.id },
      data,
    });

    if (dto.electricityPricePerKwh !== undefined) {
      try {
        await this.resyncAllShiftElectricityExpenses();
      } catch (err) {
        this.logger.warn(
          `resyncAllShiftElectricityExpenses after salary settings: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    return updated;
  }

  /**
   * Xarajatlar sahifasidan: faqat kVt·soat narxi yangilanadi (soliq foizlari DBdagi qiymatda qoladi).
   */
  async patchElectricityPricePerKwh(electricityPricePerKwh: number) {
    const existing = await this.prisma.salarySetting.findFirst();
    if (!existing) {
      const created = await this.prisma.salarySetting.create({
        data: {
          incomeTaxPercent: 12,
          otherDeductionPercent: 0,
          socialTaxPercent: 0,
          npsPercent: 0,
          electricityPricePerKwh,
        },
      });
      try {
        await this.resyncAllShiftElectricityExpenses();
      } catch (err) {
        this.logger.warn(
          `resyncAllShiftElectricityExpenses after create salary settings: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
      return created;
    }

    const updated = await this.prisma.salarySetting.update({
      where: { id: existing.id },
      data: { electricityPricePerKwh },
    });

    try {
      await this.resyncAllShiftElectricityExpenses();
    } catch (err) {
      this.logger.warn(
        `resyncAllShiftElectricityExpenses after electricity price patch: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    return updated;
  }

  getSalarySettings() {
    return this.prisma.salarySetting.findFirst();
  }

  async uploadOborotka(file: Express.Multer.File, uploadedById?: string) {
    if (!file) {
      throw new BadRequestException('Oborotka file is required');
    }

    const vedomost = await this.prisma.bankVedomost.create({
      data: {
        fileName: file.originalname,
        status: BankVedomostStatus.DRAFT,
        uploadedById: uploadedById ?? null,
      },
    });

    try {
      if (!file.originalname.toLowerCase().endsWith('.xlsx')) {
        throw new Error('Only .xlsx files are supported');
      }

      const rows = this.parseOborotkaRows(file.buffer);
      if (rows.length === 0) {
        throw new Error('No rows found in the first sheet');
      }

      const employees = await this.prisma.user.findMany({
        where: { role: Role.WORKER },
        select: this.getPublicWorkerSelect(),
      });
      const clients = await this.prisma.client.findMany({
        select: {
          id: true,
          name: true,
          bankAccount: true,
          bankName: true,
        },
      });

      const existingTransactions = await this.prisma.bankTransaction.findMany({
        select: { documentNumber: true, amount: true },
      });

      const duplicateKeys = new Set(
        existingTransactions
          .map((item) => this.buildDuplicateKey(item.documentNumber, item.amount))
          .filter((item): item is string => Boolean(item)),
      );

      let totalIncome = 0;
      let totalExpense = 0;
      let skippedInvalid = 0;
      let skippedDuplicate = 0;

      const transactions = rows.flatMap((row) => {
        const debit = row.debit > 0 ? row.debit : 0;
        const credit = row.credit > 0 ? row.credit : 0;
        const amount = debit > 0 ? debit : credit;

        if (!row.operationDate || amount <= 0 || (!debit && !credit)) {
          skippedInvalid += 1;
          return [];
        }

        const duplicateKey = this.buildDuplicateKey(row.documentNumber, amount);
        if (duplicateKey && duplicateKeys.has(duplicateKey)) {
          skippedDuplicate += 1;
          return [];
        }
        if (duplicateKey) {
          duplicateKeys.add(duplicateKey);
        }

        const type =
          debit > 0 ? BankTransactionType.EXPENSE : BankTransactionType.INCOME;
        if (type === BankTransactionType.INCOME) {
          totalIncome += amount;
        } else {
          totalExpense += amount;
        }

        const employeeMatch =
          type === BankTransactionType.EXPENSE
            ? this.matchEmployee(row, employees)
            : { employee: null, isSalaryCandidate: false, unresolved: false };
        const clientMatch =
          type === BankTransactionType.INCOME
            ? this.matchClient(row, clients)
            : { client: null, unresolved: false };

        return [
          {
            bankVedomostId: vedomost.id,
            type,
            amount,
            documentDate: row.documentDate,
            documentNumber: row.documentNumber,
            operationDate: row.operationDate,
            receiverName: row.receiverName,
            receiverAccount: row.receiverAccount,
            receiverBankName: row.receiverBankName,
            receiverStir: normalizeDigits(row.receiverStir),
            paymentPurpose: row.paymentPurpose,
            isSalary: Boolean(employeeMatch.employee),
            employeeId: employeeMatch.employee?.id ?? null,
            clientId: clientMatch.client?.id ?? null,
          },
        ];
      });

      if (transactions.length === 0) {
        throw new Error('No valid transactions found after validation');
      }

      await this.prisma.bankTransaction.createMany({
        data: transactions,
      });

      const notes: string[] = [];
      if (skippedInvalid > 0) {
        notes.push(`Skipped invalid rows: ${skippedInvalid}`);
      }
      if (skippedDuplicate > 0) {
        notes.push(`Skipped duplicates: ${skippedDuplicate}`);
      }

      await this.prisma.bankVedomost.update({
        where: { id: vedomost.id },
        data: {
          totalIncome,
          totalExpense,
          status: BankVedomostStatus.PARSED,
          errorMessage: notes.length > 0 ? notes.join('. ') : null,
        },
      });

      await this.reconcileBankVedomost(vedomost.id);
    } catch (error) {
      await this.prisma.bankVedomost.update({
        where: { id: vedomost.id },
        data: {
          status: BankVedomostStatus.REJECTED,
          errorMessage:
            error instanceof Error ? error.message : 'Failed to parse oborotka file',
        },
      });
    }

    return this.getBankVedomostById(vedomost.id);
  }

  getBankVedomosts() {
    return this.prisma.bankVedomost.findMany({
      include: {
        uploadedBy: {
          select: { id: true, fullName: true },
        },
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBankVedomostById(id: string) {
    const vedomost = await this.prisma.bankVedomost.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: { id: true, fullName: true },
        },
        transactions: {
          include: {
            employee: {
              select: this.getPublicWorkerSelect(),
            },
            client: {
              select: {
                id: true,
                name: true,
                bankAccount: true,
                bankName: true,
              },
            },
          },
          orderBy: [{ operationDate: 'desc' }, { createdAt: 'desc' }],
        },
      },
    });

    if (!vedomost) {
      throw new NotFoundException('Bank vedomost not found');
    }

    const unresolvedEmployees = this.collectUnresolvedEmployees(vedomost.transactions);
    const unresolvedClients = this.collectUnresolvedClients(vedomost.transactions);

    return {
      ...vedomost,
      unresolvedEmployees,
      unresolvedClients,
      warnings: {
        unresolvedEmployeesCount: unresolvedEmployees.length,
        unresolvedClientsCount: unresolvedClients.length,
      },
    };
  }

  async getSalaryVedomostSummary(month?: string) {
    const records = await this.prisma.salaryRecord.findMany({
      where: month ? { month } : undefined,
      include: {
        worker: {
          select: this.getPublicWorkerSelect(),
        },
      },
      orderBy: [{ month: 'desc' }, { createdAt: 'desc' }],
    });

    const transactions = await this.prisma.bankTransaction.findMany({
      where: {
        isSalary: true,
        type: BankTransactionType.EXPENSE,
        employeeId: { not: null },
      },
      orderBy: { operationDate: 'desc' },
    });

    const paidMap = new Map<
      string,
      { paidAmount: number; transactionsCount: number; lastPaymentDate: string | null }
    >();

    for (const transaction of transactions) {
      if (!transaction.employeeId) {
        continue;
      }
      const key = `${transaction.employeeId}:${monthFromDate(transaction.operationDate)}`;
      const current = paidMap.get(key) ?? {
        paidAmount: 0,
        transactionsCount: 0,
        lastPaymentDate: null,
      };
      current.paidAmount += transaction.amount;
      current.transactionsCount += 1;
      current.lastPaymentDate = transaction.operationDate.toISOString();
      paidMap.set(key, current);
    }

    return records.map((record) => {
      const key = `${record.workerId}:${record.month}`;
      const paymentInfo = paidMap.get(key);
      const requiredAmount = record.netto;
      const paidAmount = paymentInfo?.paidAmount ?? 0;
      const remainingAmount = Math.max(0, requiredAmount - paidAmount);
      return {
        id: record.id,
        employeeId: record.workerId,
        employeeName: record.worker.fullName,
        amount: requiredAmount,
        requiredAmount,
        paidAmount,
        remainingAmount,
        period: record.month,
        status: this.resolveSalaryStatus(paidAmount, requiredAmount),
        transactionsCount: paymentInfo?.transactionsCount ?? 0,
        lastPaymentDate: paymentInfo?.lastPaymentDate ?? null,
      };
    });
  }

  async createEmployeeFromTransaction(transactionId: string) {
    const transaction = await this.prisma.bankTransaction.findUnique({
      where: { id: transactionId },
    });
    if (!transaction) {
      throw new NotFoundException('Bank transaction not found');
    }

    const fullName = transaction.receiverName?.trim();
    if (!fullName) {
      throw new BadRequestException('Receiver name is required to create employee');
    }

    const stir = normalizeDigits(transaction.receiverStir);
    const phone = await this.allocatePlaceholderWorkerPhone();
    const employee = await this.prisma.user.create({
      data: {
        fullName,
        stir,
        phone,
        passwordHash: '$2b$10$placeholderplaceholderplaceholderplcace',
        role: Role.WORKER,
        salaryType: SalaryType.PER_PRODUCT,
        salaryRate: 0,
        canLogin: false,
      },
      select: this.getPublicWorkerSelect(),
    });

    await this.reconcileBankVedomost(transaction.bankVedomostId);
    return employee;
  }

  async createClientFromTransaction(transactionId: string) {
    const transaction = await this.prisma.bankTransaction.findUnique({
      where: { id: transactionId },
    });
    if (!transaction) {
      throw new NotFoundException('Bank transaction not found');
    }

    const name = transaction.receiverName?.trim();
    if (!name) {
      throw new BadRequestException('Receiver name is required to create client');
    }

    const phone = await this.allocatePlaceholderClientPhone();
    const client = await this.prisma.client.create({
      data: {
        name,
        phone,
        bankAccount: transaction.receiverAccount?.trim() || null,
        bankName: transaction.receiverBankName?.trim() || null,
      },
    });

    await this.reconcileBankVedomost(transaction.bankVedomostId);
    return client;
  }

  async reconcileBankVedomost(bankVedomostId: string) {
    const [employees, clients, transactions] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: Role.WORKER },
        select: this.getPublicWorkerSelect(),
      }),
      this.prisma.client.findMany({
        select: {
          id: true,
          name: true,
          bankAccount: true,
          bankName: true,
        },
      }),
      this.prisma.bankTransaction.findMany({
        where: { bankVedomostId },
      }),
    ]);

    for (const transaction of transactions) {
      const row: ParsedBankRow = {
        documentDate: transaction.documentDate,
        documentNumber: transaction.documentNumber,
        operationDate: transaction.operationDate,
        debit: transaction.type === BankTransactionType.EXPENSE ? transaction.amount : 0,
        credit: transaction.type === BankTransactionType.INCOME ? transaction.amount : 0,
        receiverName: transaction.receiverName,
        receiverAccount: transaction.receiverAccount,
        receiverBankName: transaction.receiverBankName,
        receiverStir: transaction.receiverStir,
        paymentPurpose: transaction.paymentPurpose,
      };

      const employeeMatch =
        transaction.type === BankTransactionType.EXPENSE
          ? this.matchEmployee(row, employees)
          : { employee: null, isSalaryCandidate: false, unresolved: false };
      const clientMatch =
        transaction.type === BankTransactionType.INCOME
          ? this.matchClient(row, clients)
          : { client: null, unresolved: false };

      await this.syncClientBankInfo(clientMatch.client, row);

      await this.prisma.bankTransaction.update({
        where: { id: transaction.id },
        data: {
          employeeId: employeeMatch.employee?.id ?? null,
          isSalary: Boolean(employeeMatch.employee),
          clientId: clientMatch.client?.id ?? null,
        },
      });
    }

    return this.getBankVedomostById(bankVedomostId);
  }

  async generateSalary(dto: GenerateSalaryDto) {
    const { start, end } = getMonthRange(dto.month);
    const settings =
      (await this.prisma.salarySetting.findFirst()) ??
      (await this.prisma.salarySetting.create({
        data: {
          incomeTaxPercent: 12,
          otherDeductionPercent: 0,
          socialTaxPercent: 0,
          npsPercent: 0,
        },
      }));

    const workers = await this.prisma.user.findMany({
      where: {
        role: Role.WORKER,
      },
    });

    for (const worker of workers) {
      const shiftsInMonth = await this.prisma.shiftRecord.findMany({
        where: {
          workerId: worker.id,
          status: EntityStatus.COMPLETED,
          date: {
            gte: start,
            lt: end,
          },
        },
      });
      const distinctShiftDates = new Set(
        shiftsInMonth.map((s) => {
          const d = new Date(s.date);
          return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
        }),
      );
      const workedDays = distinctShiftDates.size;
      const configuredRates = await this.prisma.employeeProductRate.findMany({
        where: { workerId: worker.id },
      });
      const rateMap = new Map(
        configuredRates.map((item) => [item.productLabel, item]),
      );

      const computedProductionAmount = shiftsInMonth.reduce((sum, shift) => {
        const label = shift.productLabel ?? '';
        const rateConfig = rateMap.get(label);
        const qty = shift.producedQty;
        if (!rateConfig) {
          return sum;
        }

        if (rateConfig.rateType === EmployeeRateType.PERCENT) {
          const baseAmount = rateConfig.baseAmount ?? 0;
          return sum + ((baseAmount * rateConfig.rateValue) / 100) * qty;
        }

        return sum + rateConfig.rateValue * qty;
      }, 0);

      const producedQuantity = shiftsInMonth.reduce(
        (sum, shift) => sum + shift.producedQty,
        0,
      );
      const productionAmount = computedProductionAmount;

      const brutto =
        worker.salaryType === SalaryType.FIXED
          ? worker.salaryRate
          : worker.salaryType === SalaryType.PER_PRODUCT
            ? productionAmount
            : worker.salaryRate + productionAmount;
      const aklad =
        worker.salaryType === SalaryType.PER_PRODUCT ? 0 : worker.salaryRate;
      const bonus = 0;

      const incomeTax = (brutto * settings.incomeTaxPercent) / 100;
      const otherDeductions = (brutto * settings.otherDeductionPercent) / 100;
      const socialTax = (brutto * settings.socialTaxPercent) / 100;
      const nps = (brutto * settings.npsPercent) / 100;
      const netto = brutto - incomeTax;

      await this.prisma.salaryRecord.upsert({
        where: {
          workerId_month: {
            workerId: worker.id,
            month: dto.month,
          },
        },
        update: {
          workedDays,
          producedQuantity,
          productionAmount,
          aklad,
          bonus,
          brutto,
          incomeTax,
          otherDeductions,
          socialTax,
          nps,
          netto,
          status: EntityStatus.COMPLETED,
        },
        create: {
          workerId: worker.id,
          month: dto.month,
          workedDays,
          producedQuantity,
          productionAmount,
          aklad,
          bonus,
          brutto,
          incomeTax,
          otherDeductions,
          socialTax,
          nps,
          netto,
          isPaid: false,
          status: EntityStatus.COMPLETED,
        },
      });
    }

    return this.prisma.salaryRecord.findMany({
      where: { month: dto.month },
      include: {
        worker: {
          select: this.getPublicWorkerSelect(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  getSalaryRecords(currentUserId?: string, currentUserRole?: Role) {
    return this.prisma.salaryRecord.findMany({
      where:
        currentUserRole === Role.WORKER
          ? { workerId: currentUserId }
          : undefined,
      include: {
        worker: {
          select: this.getPublicWorkerSelect(),
        },
      },
      orderBy: [{ month: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getSalaryRecordById(
    id: string,
    currentUserId?: string,
    currentUserRole?: Role,
  ) {
    const record = await this.prisma.salaryRecord.findUnique({
      where: { id },
      include: {
        worker: {
          select: this.getPublicWorkerSelect(),
        },
      },
    });

    if (!record) {
      throw new NotFoundException('Salary record not found');
    }

    if (currentUserRole === Role.WORKER && record.workerId !== currentUserId) {
      throw new NotFoundException('Salary record not found');
    }

    return record;
  }

  async updateSalaryRecord(id: string, dto: UpdateSalaryRecordDto) {
    const existing = await this.prisma.salaryRecord.findUnique({
      where: { id },
      include: { worker: true },
    });

    if (!existing) {
      throw new NotFoundException('Salary record not found');
    }

    const bonus = dto.bonus ?? existing.bonus;
    const workedDays = dto.workedDays ?? existing.workedDays;
    const brutto = existing.aklad + existing.productionAmount + bonus;
    const settings = await this.prisma.salarySetting.findFirst();
    const incomeTaxPercent = settings?.incomeTaxPercent ?? 12;
    const otherDeductionPercent = settings?.otherDeductionPercent ?? 0;
    const socialTaxPercent = settings?.socialTaxPercent ?? 0;
    const npsPercent = settings?.npsPercent ?? 0;

    const incomeTax = (brutto * incomeTaxPercent) / 100;
    const otherDeductions = (brutto * otherDeductionPercent) / 100;
    const socialTax = (brutto * socialTaxPercent) / 100;
    const nps = (brutto * npsPercent) / 100;
    const netto = brutto - incomeTax;

    return this.prisma.salaryRecord.update({
      where: { id },
      data: {
        bonus,
        workedDays,
        brutto,
        incomeTax,
        otherDeductions,
        socialTax,
        nps,
        netto,
        isPaid: dto.isPaid ?? existing.isPaid,
      },
      include: {
        worker: {
          select: this.getPublicWorkerSelect(),
        },
      },
    });
  }

  setMonthPaidStatus(dto: SetMonthPaidDto) {
    return this.prisma.salaryRecord.updateMany({
      where: { month: dto.month },
      data: {
        isPaid: dto.isPaid,
      },
    });
  }

  private getPublicWorkerSelect() {
    return {
      id: true,
      fullName: true,
      position: true,
      cardNumber: true,
      phone: true,
      preferredShiftNumber: true,
      stir: true,
      salaryType: true,
      salaryRate: true,
      createdAt: true,
    };
  }

  private async allocatePlaceholderWorkerPhone(): Promise<string> {
    for (let i = 0; i < 50; i += 1) {
      const suffix = `${90000000 + Math.floor(Math.random() * 9999999)}`.slice(0, 8);
      const phone = `+99877${suffix}`;
      const exists = await this.prisma.user.findUnique({ where: { phone } });
      if (!exists) {
        return phone;
      }
    }
    throw new BadRequestException('Could not allocate unique worker phone');
  }

  private async allocatePlaceholderClientPhone(): Promise<string> {
    for (let i = 0; i < 50; i += 1) {
      const suffix = `${90000000 + Math.floor(Math.random() * 9999999)}`.slice(0, 8);
      const phone = `+99888${suffix}`;
      const exists = await this.prisma.client.findUnique({ where: { phone } });
      if (!exists) {
        return phone;
      }
    }
    throw new BadRequestException('Could not allocate unique client phone');
  }

  private resolveSalaryStatus(paidAmount: number, requiredAmount: number) {
    if (paidAmount <= 0.01) {
      return 'pending';
    }
    if (paidAmount + 0.01 < requiredAmount) {
      return 'partial';
    }
    return 'paid';
  }

  private buildDuplicateKey(documentNumber: string | null, amount: number) {
    const normalizedDocumentNumber = documentNumber?.trim();
    if (!normalizedDocumentNumber) {
      return null;
    }
    return `${normalizedDocumentNumber}::${amount.toFixed(2)}`;
  }

  private matchEmployee(
    row: ParsedBankRow,
    employees: Array<{
      id: string;
      fullName: string;
      stir: string | null;
    }>,
  ): EmployeeMatchResult {
    const purpose = normalizeText(row.paymentPurpose);
    const isSalaryByPurpose = SALARY_PURPOSE_KEYWORDS.some((keyword) =>
      purpose.includes(normalizeText(keyword)),
    );
    if (!isSalaryByPurpose) {
      return { employee: null, isSalaryCandidate: false, unresolved: false };
    }

    const receiverStir = normalizeDigits(row.receiverStir);
    if (receiverStir) {
      const stirMatches = employees.filter(
        (employee) => normalizeDigits(employee.stir) === receiverStir,
      );
      if (stirMatches.length === 1) {
        return { employee: stirMatches[0], isSalaryCandidate: true, unresolved: false };
      }
    }

    const receiverName = normalizeText(row.receiverName);
    if (!receiverName) {
      return { employee: null, isSalaryCandidate: true, unresolved: true };
    }

    const nameMatches = employees.filter((employee) => {
      const employeeName = normalizeText(employee.fullName);
      return (
        employeeName === receiverName ||
        employeeName.includes(receiverName) ||
        receiverName.includes(employeeName)
      );
    });

    if (nameMatches.length === 1) {
      return { employee: nameMatches[0], isSalaryCandidate: true, unresolved: false };
    }

    return { employee: null, isSalaryCandidate: true, unresolved: true };
  }

  private matchClient(
    row: ParsedBankRow,
    clients: Array<{
      id: string;
      name: string;
      bankAccount: string | null;
      bankName: string | null;
    }>,
  ): ClientMatchResult {
    const receiverAccount = normalizeDigits(row.receiverAccount);
    if (receiverAccount) {
      const accountMatches = clients.filter(
        (client) => normalizeDigits(client.bankAccount) === receiverAccount,
      );
      if (accountMatches.length === 1) {
        return { client: accountMatches[0], unresolved: false };
      }
    }

    const receiverName = normalizeText(row.receiverName);
    if (!receiverName) {
      return { client: null, unresolved: false };
    }

    const nameMatches = clients.filter((client) => {
      const clientName = normalizeText(client.name);
      return (
        clientName === receiverName ||
        clientName.includes(receiverName) ||
        receiverName.includes(clientName)
      );
    });

    if (nameMatches.length === 1) {
      return { client: nameMatches[0], unresolved: false };
    }

    return { client: null, unresolved: true };
  }

  private collectUnresolvedEmployees(
    transactions: Array<{
      id: string;
      receiverName: string | null;
      receiverStir: string | null;
      paymentPurpose: string | null;
      isSalary: boolean;
      employeeId: string | null;
      amount: number;
    }>,
  ) {
    const map = new Map<string, {
      receiverName: string | null;
      receiverStir: string | null;
      paymentPurpose: string | null;
      totalAmount: number;
      transactionIds: string[];
    }>();

    for (const transaction of transactions) {
      const purpose = normalizeText(transaction.paymentPurpose);
      const isSalaryCandidate = SALARY_PURPOSE_KEYWORDS.some((keyword) =>
        purpose.includes(normalizeText(keyword)),
      );
      if (!isSalaryCandidate || transaction.employeeId) {
        continue;
      }
      const key =
        `${normalizeText(transaction.receiverName)}::${normalizeDigits(transaction.receiverStir) ?? ''}`;
      const current = map.get(key) ?? {
        receiverName: transaction.receiverName,
        receiverStir: transaction.receiverStir,
        paymentPurpose: transaction.paymentPurpose,
        totalAmount: 0,
        transactionIds: [],
      };
      current.totalAmount += transaction.amount;
      current.transactionIds.push(transaction.id);
      map.set(key, current);
    }

    return [...map.values()];
  }

  private collectUnresolvedClients(
    transactions: Array<{
      id: string;
      type: BankTransactionType;
      receiverName: string | null;
      receiverAccount: string | null;
      receiverBankName: string | null;
      clientId: string | null;
      amount: number;
    }>,
  ) {
    const map = new Map<string, {
      receiverName: string | null;
      receiverAccount: string | null;
      receiverBankName: string | null;
      totalAmount: number;
      transactionIds: string[];
    }>();

    for (const transaction of transactions) {
      if (transaction.type !== BankTransactionType.INCOME || transaction.clientId) {
        continue;
      }
      const key =
        `${normalizeText(transaction.receiverName)}::${normalizeDigits(transaction.receiverAccount) ?? ''}`;
      const current = map.get(key) ?? {
        receiverName: transaction.receiverName,
        receiverAccount: transaction.receiverAccount,
        receiverBankName: transaction.receiverBankName,
        totalAmount: 0,
        transactionIds: [],
      };
      current.totalAmount += transaction.amount;
      current.transactionIds.push(transaction.id);
      map.set(key, current);
    }

    return [...map.values()];
  }

  private parseOborotkaRows(buffer: Buffer): ParsedBankRow[] {
    const workbook = XLSX.read(buffer, {
      type: 'buffer',
      cellDates: true,
    });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new Error('Workbook does not contain any sheet');
    }

    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: null,
      raw: false,
    });

    return rows
      .filter((row) => !isEmptyRow(row))
      .map((row) => ({
        documentDate: parseDateValue(
          getFieldValue(row, [
            'document date',
            'hujjat sanasi',
            'дата документа',
          ]),
        ),
        documentNumber: String(
          getFieldValue(row, [
            'document number',
            'hujjat raqami',
            'номер документа',
          ]) ?? '',
        ).trim() || null,
        operationDate: parseDateValue(
          getFieldValue(row, [
            'operation date',
            'operatsiya sanasi',
            'дата операции',
          ]),
        ),
        debit: parseAmount(
          getFieldValue(row, ['debit', 'chiqim', 'расход', 'debet']),
        ),
        credit: parseAmount(
          getFieldValue(row, ['credit', 'kirim', 'приход', 'kredit']),
        ),
        receiverName:
          String(
            getFieldValue(row, [
              'receiver name',
              'получатель',
              'oluvchi',
              'naimenovanie poluchatelya',
            ]) ?? '',
          ).trim() || null,
        receiverAccount:
          String(
            getFieldValue(row, [
              'receiver account',
              'hisob raqami',
              'счет получателя',
            ]) ?? '',
          ).trim() || null,
        receiverBankName:
          String(
            getFieldValue(row, [
              'receiver bank name',
              'bank nomi',
              'банк получателя',
            ]) ?? '',
          ).trim() || null,
        receiverStir:
          String(
            getFieldValue(row, ['receiver stir', 'stir', 'inn', 'инн']) ?? '',
          ).trim() || null,
        paymentPurpose:
          String(
            getFieldValue(row, [
              'payment purpose',
              'tolov maqsadi',
              'to lov maqsadi',
              'назначение платежа',
            ]) ?? '',
          ).trim() || null,
      }));
  }
}
