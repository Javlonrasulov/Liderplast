import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BankCounterpartyKind,
  BankRowReviewStatus,
  BankStatementSource,
  BankTransactionType,
  BankVedomostStatus,
  Role,
} from '../../generated/prisma/enums.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { FinanceService } from './finance.service.js';
import { KassaService } from './kassa.service.js';
import { ConfirmStatementRowDto } from './dto/confirm-statement-row.dto.js';
import { UpdateStatementRowDto } from './dto/update-statement-row.dto.js';
import { parseBankStatementRows, isExcelBuffer, type ParsedBankStatementRow } from './bank-statement-parse.js';

const SALARY_PURPOSE_KEYWORDS = ['oylik', 'ish haqi', 'zarplata', 'salary'];
const IMPORT_FUNDING_SOURCE_NAME = 'Bank/Import';

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

const transactionInclude = {
  client: {
    select: { id: true, name: true, bankAccount: true, bankName: true, stir: true },
  },
  supplier: {
    select: { id: true, name: true, bankAccount: true, bankName: true, stir: true },
  },
  employee: { select: { id: true, fullName: true } },
  expense: { select: { id: true, amount: true, title: true } },
  kassaEntry: { select: { id: true } },
  createdBy: { select: { id: true, fullName: true } },
  updatedBy: { select: { id: true, fullName: true } },
} as const;

type LightClient = {
  id: string;
  name: string;
  bankAccount: string | null;
  stir: string | null;
};
type LightSupplier = {
  id: string;
  name: string;
  bankAccount: string | null;
  stir: string | null;
};
type LightEmployee = { id: string; fullName: string; stir: string | null };

@Injectable()
export class StatementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly financeService: FinanceService,
    private readonly kassaService: KassaService,
  ) {}

  private matchClient(row: ParsedBankStatementRow, clients: LightClient[]) {
    const account = normalizeDigits(row.receiverAccount);
    if (account) {
      const byAccount = clients.filter(
        (c) => normalizeDigits(c.bankAccount) === account,
      );
      if (byAccount.length === 1) {
        return byAccount[0];
      }
    }
    const stir = normalizeDigits(row.receiverStir);
    if (stir) {
      const byStir = clients.filter((c) => normalizeDigits(c.stir) === stir);
      if (byStir.length === 1) {
        return byStir[0];
      }
    }
    const name = normalizeText(row.receiverName);
    if (!name) {
      return null;
    }
    const byName = clients.filter((c) => {
      const cn = normalizeText(c.name);
      return cn === name || cn.includes(name) || name.includes(cn);
    });
    return byName.length === 1 ? byName[0] : null;
  }

  private matchSupplier(row: ParsedBankStatementRow, suppliers: LightSupplier[]) {
    const account = normalizeDigits(row.receiverAccount);
    if (account) {
      const byAccount = suppliers.filter(
        (s) => normalizeDigits(s.bankAccount) === account,
      );
      if (byAccount.length === 1) {
        return byAccount[0];
      }
    }
    const stir = normalizeDigits(row.receiverStir);
    if (stir) {
      const byStir = suppliers.filter((s) => normalizeDigits(s.stir) === stir);
      if (byStir.length === 1) {
        return byStir[0];
      }
    }
    const name = normalizeText(row.receiverName);
    if (!name) {
      return null;
    }
    const byName = suppliers.filter((s) => {
      const sn = normalizeText(s.name);
      return sn === name || sn.includes(name) || name.includes(sn);
    });
    return byName.length === 1 ? byName[0] : null;
  }

  private matchEmployee(row: ParsedBankStatementRow, employees: LightEmployee[]) {
    const purpose = normalizeText(row.paymentPurpose);
    const isSalary = SALARY_PURPOSE_KEYWORDS.some((keyword) =>
      purpose.includes(normalizeText(keyword)),
    );
    if (!isSalary) {
      return null;
    }
    const stir = normalizeDigits(row.receiverStir);
    if (stir) {
      const byStir = employees.filter((e) => normalizeDigits(e.stir) === stir);
      if (byStir.length === 1) {
        return byStir[0];
      }
    }
    const name = normalizeText(row.receiverName);
    if (!name) {
      return null;
    }
    const byName = employees.filter((e) => {
      const en = normalizeText(e.fullName);
      return en === name || en.includes(name) || name.includes(en);
    });
    return byName.length === 1 ? byName[0] : null;
  }

  async upload(
    file: Express.Multer.File,
    source: BankStatementSource,
    uploadedById?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Fayl talab qilinadi');
    }

    const vedomost = await this.prisma.bankVedomost.create({
      data: {
        fileName: file.originalname,
        source,
        status: BankVedomostStatus.DRAFT,
        uploadedById: uploadedById ?? null,
      },
    });

    try {
      const lowerName = file.originalname.toLowerCase();
      const hasExcelExtension =
        lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls');
      if (!hasExcelExtension && !isExcelBuffer(file.buffer)) {
        throw new Error(
          'Faqat Excel fayllar (.xlsx, .xls) qo‘llab-quvvatlanadi. Telegramdan yuklab, Excel sifatida saqlang.',
        );
      }
      if (!isExcelBuffer(file.buffer)) {
        throw new Error(
          'Fayl Excel formatida emas. Faylni bankdan to‘g‘ridan-to‘g‘ri .xlsx qilib yuklab oling.',
        );
      }

      const rows = parseBankStatementRows(file.buffer);
      if (rows.length === 0) {
        throw new Error(
          'Excel faylida ma’lumot qatorlari topilmadi. Ustun sarlavhalari (kirim/chiqim, sana) borligini tekshiring.',
        );
      }

      const [clients, suppliers, employees, companyAccounts, existing] =
        await Promise.all([
          this.prisma.client.findMany({
            select: { id: true, name: true, bankAccount: true, stir: true },
          }),
          this.prisma.supplier.findMany({
            where: { isDeleted: false },
            select: { id: true, name: true, bankAccount: true, stir: true },
          }),
          this.prisma.user.findMany({
            where: { role: Role.WORKER },
            select: { id: true, fullName: true, stir: true },
          }),
          this.prisma.companyBankAccount.findMany({
            select: { accountNumber: true },
          }),
          this.prisma.bankTransaction.findMany({
            select: { documentNumber: true, amount: true },
          }),
        ]);

      const companyAccountSet = new Set(
        companyAccounts
          .map((c) => normalizeDigits(c.accountNumber))
          .filter((c): c is string => Boolean(c)),
      );
      const duplicateKeys = new Set(
        existing
          .map((item) => this.buildDuplicateKey(item.documentNumber, item.amount))
          .filter((item): item is string => Boolean(item)),
      );

      let totalIncome = 0;
      let totalExpense = 0;
      let skippedInvalid = 0;
      let skippedDuplicate = 0;

      const data = rows.flatMap((row) => {
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

        const receiverAccountDigits = normalizeDigits(row.receiverAccount);
        const companyColumnDigits = normalizeDigits(row.companyAccount);
        const isCompanyAccount =
          (receiverAccountDigits
            ? companyAccountSet.has(receiverAccountDigits)
            : false) ||
          (type === BankTransactionType.INCOME &&
          companyColumnDigits
            ? companyAccountSet.has(companyColumnDigits)
            : false);

        let counterpartyKind: BankCounterpartyKind = BankCounterpartyKind.UNKNOWN;
        let clientId: string | null = null;
        let supplierId: string | null = null;
        let employeeId: string | null = null;
        let isSalary = false;

        if (isCompanyAccount) {
          counterpartyKind = BankCounterpartyKind.COMPANY;
        } else if (type === BankTransactionType.INCOME) {
          const client = this.matchClient(row, clients);
          if (client) {
            counterpartyKind = BankCounterpartyKind.CLIENT;
            clientId = client.id;
          }
        } else {
          const supplier = this.matchSupplier(row, suppliers);
          if (supplier) {
            counterpartyKind = BankCounterpartyKind.SUPPLIER;
            supplierId = supplier.id;
          } else {
            const employee = this.matchEmployee(row, employees);
            if (employee) {
              employeeId = employee.id;
              isSalary = true;
            }
          }
        }

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
            receiverBankCode: row.receiverBankCode,
            receiverBankName: row.receiverBankName,
            receiverStir: normalizeDigits(row.receiverStir),
            paymentPurpose: row.paymentPurpose,
            companyAccount: row.companyAccount,
            companyBankName: row.companyBankName,
            companyStir: normalizeDigits(row.companyStir),
            isSalary,
            employeeId,
            clientId,
            supplierId,
            counterpartyKind,
            reviewStatus: BankRowReviewStatus.PENDING,
            createdById: uploadedById ?? null,
          },
        ];
      });

      if (data.length === 0) {
        if (skippedDuplicate > 0 && skippedInvalid === 0) {
          throw new Error(
            `Barcha qatorlar (${skippedDuplicate} ta) ilgari boshqa ko‘chirmada yuklangan. Bu fayl takror hisoblanadi.`,
          );
        }
        if (skippedInvalid > 0 && skippedDuplicate === 0) {
          throw new Error(
            `Fayldan hech qanday qator o‘qilmadi (${skippedInvalid} ta yaroqsiz qator). Excel ustunlari bank ko‘chirmasi formatida ekanini tekshiring.`,
          );
        }
        throw new Error(
          `Yaroqli qator topilmadi. Yaroqsiz: ${skippedInvalid}, takroriy: ${skippedDuplicate}.`,
        );
      }

      await this.prisma.bankTransaction.createMany({ data });

      const notes: string[] = [];
      if (skippedInvalid > 0) {
        notes.push(`Yaroqsiz qatorlar o‘tkazib yuborildi: ${skippedInvalid}`);
      }
      if (skippedDuplicate > 0) {
        notes.push(`Takroriy qatorlar o‘tkazib yuborildi: ${skippedDuplicate}`);
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
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Faylni o‘qishda xatolik';
      await this.prisma.bankVedomost.update({
        where: { id: vedomost.id },
        data: {
          status: BankVedomostStatus.REJECTED,
          errorMessage: message,
        },
      });
      throw new BadRequestException(message);
    }

    return this.getStatement(vedomost.id);
  }

  listStatements(source?: BankStatementSource) {
    return this.prisma.bankVedomost.findMany({
      where: source ? { source } : undefined,
      include: {
        uploadedBy: { select: { id: true, fullName: true } },
        _count: { select: { transactions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStatement(id: string) {
    const vedomost = await this.prisma.bankVedomost.findUnique({
      where: { id },
      include: {
        uploadedBy: { select: { id: true, fullName: true } },
        transactions: {
          include: transactionInclude,
          orderBy: [{ operationDate: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });
    if (!vedomost) {
      throw new NotFoundException('Ko‘chirma topilmadi');
    }

    const pendingCount = vedomost.transactions.filter(
      (t) => t.reviewStatus === BankRowReviewStatus.PENDING,
    ).length;
    const confirmedCount = vedomost.transactions.filter(
      (t) => t.reviewStatus === BankRowReviewStatus.CONFIRMED,
    ).length;
    const skippedCount = vedomost.transactions.filter(
      (t) => t.reviewStatus === BankRowReviewStatus.SKIPPED,
    ).length;

    return {
      ...vedomost,
      summary: { pendingCount, confirmedCount, skippedCount },
    };
  }

  private async matchesCompanyBankAccount(transaction: {
    type: BankTransactionType;
    receiverAccount: string | null;
    companyAccount: string | null;
  }) {
    const accounts = await this.prisma.companyBankAccount.findMany({
      select: { accountNumber: true },
    });
    const companyAccountSet = new Set(
      accounts
        .map((c) => normalizeDigits(c.accountNumber))
        .filter((digits): digits is string => Boolean(digits)),
    );
    if (companyAccountSet.size === 0) {
      return false;
    }
    const receiverDigits = normalizeDigits(transaction.receiverAccount);
    const companyDigits = normalizeDigits(transaction.companyAccount);
    return (
      (receiverDigits ? companyAccountSet.has(receiverDigits) : false) ||
      (transaction.type === BankTransactionType.INCOME &&
      companyDigits
        ? companyAccountSet.has(companyDigits)
        : false)
    );
  }

  private async loadConfirmedTransactions() {
    return this.prisma.bankTransaction.findMany({
      where: { reviewStatus: BankRowReviewStatus.CONFIRMED },
      select: { type: true, amount: true, companyAccount: true },
    });
  }

  private computeSumsForAccountDigits(
    rows: Array<{
      type: BankTransactionType;
      amount: number;
      companyAccount: string | null;
    }>,
    accountDigits: string | null,
  ) {
    const filtered = accountDigits
      ? rows.filter((r) => normalizeDigits(r.companyAccount) === accountDigits)
      : rows;
    let totalIncome = 0;
    let totalExpense = 0;
    for (const row of filtered) {
      if (row.type === BankTransactionType.INCOME) {
        totalIncome += row.amount;
      } else {
        totalExpense += row.amount;
      }
    }
    return { balance: totalIncome - totalExpense, totalIncome, totalExpense };
  }

  async getBankBalance() {
    const hasActive = await this.prisma.companyBankAccount.count({
      where: { isActive: true },
    });
    if (hasActive === 0) {
      const first = await this.prisma.companyBankAccount.findFirst({
        orderBy: { createdAt: 'asc' },
      });
      if (first) {
        await this.prisma.companyBankAccount.update({
          where: { id: first.id },
          data: { isActive: true },
        });
      }
    }

    const active = await this.prisma.companyBankAccount.findFirst({
      where: { isActive: true },
      include: { updatedBy: { select: { fullName: true } } },
    });
    const rows = await this.loadConfirmedTransactions();
    if (active) {
      const sums = this.computeSumsForAccountDigits(
        rows,
        normalizeDigits(active.accountNumber),
      );
      return {
        ...sums,
        accountId: active.id,
        accountNumber: active.accountNumber,
        accountLabel: active.label,
        updatedByName: active.updatedBy?.fullName ?? null,
        updatedAt: active.updatedAt.toISOString(),
        allAccounts: false,
      };
    }
    const sums = this.computeSumsForAccountDigits(rows, null);
    return {
      ...sums,
      accountId: null,
      accountNumber: null,
      accountLabel: null,
      updatedByName: null,
      updatedAt: null,
      allAccounts: true,
    };
  }

  private buildDuplicateKey(documentNumber: string | null, amount: number) {
    const normalized = documentNumber?.trim();
    if (!normalized) {
      return null;
    }
    return `${normalized}::${amount.toFixed(2)}`;
  }

  private async ensureImportFundingSourceId(): Promise<string> {
    const existing = await this.prisma.expenseFundingSource.findFirst({
      where: { name: IMPORT_FUNDING_SOURCE_NAME, deletedAt: null },
    });
    if (existing) {
      return existing.id;
    }
    const created = await this.prisma.expenseFundingSource.create({
      data: { name: IMPORT_FUNDING_SOURCE_NAME },
    });
    return created.id;
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
    throw new BadRequestException('Mijoz uchun telefon raqam ajratib bo‘lmadi');
  }

  async confirmRow(
    rowId: string,
    dto: ConfirmStatementRowDto,
    userId?: string,
  ) {
    const transaction = await this.prisma.bankTransaction.findUnique({
      where: { id: rowId },
    });
    if (!transaction) {
      throw new NotFoundException('Qator topilmadi');
    }
    if (transaction.reviewStatus === BankRowReviewStatus.CONFIRMED) {
      throw new BadRequestException(
        'Qator allaqachon tasdiqlangan. Avval uni bekor qiling.',
      );
    }

    const amount = dto.amount ?? transaction.amount;
    if (amount <= 0) {
      throw new BadRequestException('Summa noto‘g‘ri');
    }

    let mode = dto.mode;
    if (mode === 'client_inflow' && (await this.matchesCompanyBankAccount(transaction))) {
      mode = 'kassa_inflow';
    }

    if (mode === 'client_inflow') {
      let clientId = dto.clientId ?? transaction.clientId ?? null;
      if (dto.newClient) {
        const phone =
          dto.newClient.phone?.trim() || (await this.allocatePlaceholderClientPhone());
        const client = await this.prisma.client.create({
          data: {
            name: dto.newClient.name.trim(),
            phone,
            bankAccount:
              dto.newClient.bankAccount?.trim() ||
              transaction.receiverAccount?.trim() ||
              null,
            bankName:
              dto.newClient.bankName?.trim() ||
              transaction.receiverBankName?.trim() ||
              null,
            stir: dto.newClient.stir?.trim() || transaction.receiverStir?.trim() || null,
          },
        });
        clientId = client.id;
      }
      if (!clientId) {
        throw new BadRequestException('Mijoz tanlanmagan');
      }

      const entry = await this.kassaService.createInflow(
        {
          clientId,
          amount,
          comment: dto.comment?.trim() || transaction.paymentPurpose || undefined,
          entryDate: dto.entryDate ?? transaction.operationDate.toISOString(),
        },
        userId,
      );

      await this.prisma.bankTransaction.update({
        where: { id: rowId },
        data: {
          type: BankTransactionType.INCOME,
          amount,
          clientId,
          supplierId: null,
          counterpartyKind: BankCounterpartyKind.CLIENT,
          reviewStatus: BankRowReviewStatus.CONFIRMED,
          kassaEntryId: entry.id,
          updatedById: userId ?? null,
        },
      });

      return this.getRow(rowId);
    }

    if (mode === 'kassa_inflow') {
      const entry = await this.kassaService.createBankInflow(
        {
          amount,
          comment: dto.comment?.trim() || transaction.paymentPurpose || undefined,
          entryDate: dto.entryDate ?? transaction.operationDate.toISOString(),
        },
        userId,
      );

      await this.prisma.bankTransaction.update({
        where: { id: rowId },
        data: {
          type: BankTransactionType.INCOME,
          amount,
          clientId: null,
          supplierId: null,
          counterpartyKind: BankCounterpartyKind.COMPANY,
          reviewStatus: BankRowReviewStatus.CONFIRMED,
          kassaEntryId: entry.id,
          updatedById: userId ?? null,
        },
      });

      return this.getRow(rowId);
    }

    // expense
    let supplierId = dto.supplierId ?? transaction.supplierId ?? null;
    if (dto.newSupplier) {
      const supplier = await this.prisma.supplier.create({
        data: {
          name: dto.newSupplier.name.trim(),
          phone: dto.newSupplier.phone?.trim() || null,
          bankAccount:
            dto.newSupplier.bankAccount?.trim() ||
            transaction.receiverAccount?.trim() ||
            null,
          bankName:
            dto.newSupplier.bankName?.trim() ||
            transaction.receiverBankName?.trim() ||
            null,
          stir: dto.newSupplier.stir?.trim() || transaction.receiverStir?.trim() || null,
        },
      });
      supplierId = supplier.id;
    }

    if (!dto.categoryId && !dto.newCategory?.name?.trim()) {
      throw new BadRequestException('Xarajat kategoriyasi tanlanmagan');
    }

    let categoryId = dto.categoryId ?? null;
    if (dto.newCategory?.name?.trim()) {
      const category = await this.financeService.createExpenseCategory({
        name: dto.newCategory.name.trim(),
      });
      categoryId = category.id;
    }
    if (!categoryId) {
      throw new BadRequestException('Xarajat kategoriyasi tanlanmagan');
    }

    const fundingSourceId =
      dto.fundingSourceId ?? (await this.ensureImportFundingSourceId());

    const titleBase =
      dto.comment?.trim() ||
      transaction.receiverName?.trim() ||
      transaction.paymentPurpose?.trim() ||
      'Bank chiqim';

    const expense = await this.financeService.createExpense(
      {
        title: titleBase.slice(0, 120),
        categoryId,
        fundingSourceId,
        amount,
        description:
          dto.comment?.trim() ||
          [transaction.receiverName, transaction.paymentPurpose]
            .filter(Boolean)
            .join(' — ') ||
          undefined,
        incurredAt: dto.entryDate ?? transaction.operationDate.toISOString(),
      },
      userId,
    );

    await this.prisma.bankTransaction.update({
      where: { id: rowId },
      data: {
        type: BankTransactionType.EXPENSE,
        amount,
        supplierId,
        clientId: null,
        counterpartyKind: supplierId
          ? BankCounterpartyKind.SUPPLIER
          : BankCounterpartyKind.COMPANY,
        reviewStatus: BankRowReviewStatus.CONFIRMED,
        expenseId: expense.id,
        updatedById: userId ?? null,
      },
    });

    return this.getRow(rowId);
  }

  async skipRow(rowId: string, userId?: string) {
    const transaction = await this.prisma.bankTransaction.findUnique({
      where: { id: rowId },
    });
    if (!transaction) {
      throw new NotFoundException('Qator topilmadi');
    }
    if (transaction.reviewStatus === BankRowReviewStatus.CONFIRMED) {
      throw new BadRequestException(
        'Tasdiqlangan qatorni o‘tkazib yuborib bo‘lmaydi. Avval bekor qiling.',
      );
    }
    await this.prisma.bankTransaction.update({
      where: { id: rowId },
      data: { reviewStatus: BankRowReviewStatus.SKIPPED, updatedById: userId ?? null },
    });
    return this.getRow(rowId);
  }

  async updateRow(rowId: string, dto: UpdateStatementRowDto, userId?: string) {
    const transaction = await this.prisma.bankTransaction.findUnique({
      where: { id: rowId },
    });
    if (!transaction) {
      throw new NotFoundException('Qator topilmadi');
    }
    if (transaction.reviewStatus === BankRowReviewStatus.CONFIRMED) {
      throw new BadRequestException(
        'Tasdiqlangan qatorni tahrirlash uchun avval uni bekor qiling.',
      );
    }
    await this.prisma.bankTransaction.update({
      where: { id: rowId },
      data: {
        type:
          dto.type === 'income'
            ? BankTransactionType.INCOME
            : dto.type === 'expense'
              ? BankTransactionType.EXPENSE
              : undefined,
        amount: dto.amount ?? undefined,
        operationDate: dto.operationDate ? new Date(dto.operationDate) : undefined,
        documentNumber:
          dto.documentNumber !== undefined
            ? dto.documentNumber.trim() || null
            : undefined,
        receiverName:
          dto.receiverName !== undefined ? dto.receiverName.trim() || null : undefined,
        receiverAccount:
          dto.receiverAccount !== undefined
            ? dto.receiverAccount.trim() || null
            : undefined,
        receiverBankCode:
          dto.receiverBankCode !== undefined
            ? dto.receiverBankCode.trim() || null
            : undefined,
        receiverBankName:
          dto.receiverBankName !== undefined
            ? dto.receiverBankName.trim() || null
            : undefined,
        receiverStir:
          dto.receiverStir !== undefined
            ? normalizeDigits(dto.receiverStir)
            : undefined,
        paymentPurpose:
          dto.paymentPurpose !== undefined
            ? dto.paymentPurpose.trim() || null
            : undefined,
        companyAccount:
          dto.companyAccount !== undefined
            ? dto.companyAccount.trim() || null
            : undefined,
        companyBankName:
          dto.companyBankName !== undefined
            ? dto.companyBankName.trim() || null
            : undefined,
        companyStir:
          dto.companyStir !== undefined
            ? normalizeDigits(dto.companyStir)
            : undefined,
        updatedById: userId ?? null,
      },
    });
    return this.getRow(rowId);
  }

  async deleteRow(rowId: string) {
    const transaction = await this.prisma.bankTransaction.findUnique({
      where: { id: rowId },
    });
    if (!transaction) {
      throw new NotFoundException('Qator topilmadi');
    }

    if (transaction.kassaEntryId) {
      await this.kassaService.deleteInflow(transaction.kassaEntryId);
    }
    if (transaction.expenseId) {
      await this.prisma.expense
        .delete({ where: { id: transaction.expenseId } })
        .catch(() => undefined);
    }
    await this.prisma.bankTransaction.delete({ where: { id: rowId } });
    return { success: true, bankVedomostId: transaction.bankVedomostId };
  }

  async deleteStatement(id: string) {
    const vedomost = await this.prisma.bankVedomost.findUnique({
      where: { id },
      include: {
        transactions: {
          select: { id: true, kassaEntryId: true, expenseId: true },
        },
      },
    });
    if (!vedomost) {
      throw new NotFoundException('Ko‘chirma topilmadi');
    }

    for (const transaction of vedomost.transactions) {
      if (transaction.kassaEntryId) {
        await this.kassaService.deleteInflow(transaction.kassaEntryId);
      }
      if (transaction.expenseId) {
        await this.prisma.expense
          .delete({ where: { id: transaction.expenseId } })
          .catch(() => undefined);
      }
    }

    await this.prisma.bankVedomost.delete({ where: { id } });
    return { success: true };
  }

  private async getRow(rowId: string) {
    return this.prisma.bankTransaction.findUnique({
      where: { id: rowId },
      include: transactionInclude,
    });
  }

  private mapCompanyBankAccount(
    account: {
      id: string;
      accountNumber: string;
      label: string | null;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      createdBy?: { fullName: string } | null;
      updatedBy?: { fullName: string } | null;
    },
    rows: Array<{
      type: BankTransactionType;
      amount: number;
      companyAccount: string | null;
    }>,
  ) {
    const sums = this.computeSumsForAccountDigits(
      rows,
      normalizeDigits(account.accountNumber),
    );
    return {
      id: account.id,
      accountNumber: account.accountNumber,
      label: account.label,
      isActive: account.isActive,
      balance: sums.balance,
      totalIncome: sums.totalIncome,
      totalExpense: sums.totalExpense,
      createdByName: account.createdBy?.fullName ?? null,
      updatedByName: account.updatedBy?.fullName ?? null,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    };
  }

  async getCompanyBankAccounts() {
    const hasActive = await this.prisma.companyBankAccount.count({
      where: { isActive: true },
    });
    if (hasActive === 0) {
      const first = await this.prisma.companyBankAccount.findFirst({
        orderBy: { createdAt: 'asc' },
      });
      if (first) {
        await this.prisma.companyBankAccount.update({
          where: { id: first.id },
          data: { isActive: true },
        });
      }
    }

    const [accounts, rows] = await Promise.all([
      this.prisma.companyBankAccount.findMany({
        orderBy: { createdAt: 'asc' },
        include: {
          createdBy: { select: { fullName: true } },
          updatedBy: { select: { fullName: true } },
        },
      }),
      this.loadConfirmedTransactions(),
    ]);
    return accounts.map((account) => this.mapCompanyBankAccount(account, rows));
  }

  async addCompanyBankAccount(
    accountNumber: string,
    label?: string,
    userId?: string,
  ) {
    const normalized = accountNumber.trim();
    if (!normalized) {
      throw new BadRequestException('Hisob raqami talab qilinadi');
    }
    const exists = await this.prisma.companyBankAccount.findUnique({
      where: { accountNumber: normalized },
    });
    if (exists) {
      throw new BadRequestException('Bu hisob raqami allaqachon mavjud');
    }
    const count = await this.prisma.companyBankAccount.count();
    const isFirst = count === 0;

    return this.prisma.$transaction(async (tx) => {
      const account = await tx.companyBankAccount.create({
        data: {
          accountNumber: normalized,
          label: label?.trim() || null,
          isActive: isFirst,
          createdById: userId ?? null,
          updatedById: userId ?? null,
        },
        include: {
          createdBy: { select: { fullName: true } },
          updatedBy: { select: { fullName: true } },
        },
      });
      if (userId) {
        await tx.companyBankAccountLog.create({
          data: {
            accountId: account.id,
            accountNumber: account.accountNumber,
            label: account.label,
            action: 'ADDED',
            performedById: userId,
          },
        });
        if (isFirst) {
          await tx.companyBankAccountLog.create({
            data: {
              accountId: account.id,
              accountNumber: account.accountNumber,
              label: account.label,
              action: 'ACTIVATED',
              performedById: userId,
            },
          });
        }
      }
      const rows = await tx.bankTransaction.findMany({
        where: { reviewStatus: BankRowReviewStatus.CONFIRMED },
        select: { type: true, amount: true, companyAccount: true },
      });
      return this.mapCompanyBankAccount(account, rows);
    });
  }

  async activateCompanyBankAccount(id: string, userId?: string) {
    const account = await this.prisma.companyBankAccount.findUnique({
      where: { id },
    });
    if (!account) {
      throw new NotFoundException('Hisob raqami topilmadi');
    }
    if (account.isActive) {
      const rows = await this.loadConfirmedTransactions();
      return this.mapCompanyBankAccount(
        {
          ...account,
          createdBy: null,
          updatedBy: null,
        },
        rows,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.companyBankAccount.updateMany({
        data: { isActive: false },
      });
      const updated = await tx.companyBankAccount.update({
        where: { id },
        data: { isActive: true, updatedById: userId ?? null },
        include: {
          createdBy: { select: { fullName: true } },
          updatedBy: { select: { fullName: true } },
        },
      });
      if (userId) {
        await tx.companyBankAccountLog.create({
          data: {
            accountId: updated.id,
            accountNumber: updated.accountNumber,
            label: updated.label,
            action: 'ACTIVATED',
            performedById: userId,
          },
        });
      }
      const rows = await tx.bankTransaction.findMany({
        where: { reviewStatus: BankRowReviewStatus.CONFIRMED },
        select: { type: true, amount: true, companyAccount: true },
      });
      return this.mapCompanyBankAccount(updated, rows);
    });
  }

  async deleteCompanyBankAccount(id: string, userId?: string) {
    const account = await this.prisma.companyBankAccount.findUnique({
      where: { id },
    });
    if (!account) {
      throw new NotFoundException('Hisob raqami topilmadi');
    }
    const wasActive = account.isActive;

    await this.prisma.$transaction(async (tx) => {
      await tx.companyBankAccount.delete({ where: { id } });
      if (userId) {
        await tx.companyBankAccountLog.create({
          data: {
            accountId: id,
            accountNumber: account.accountNumber,
            label: account.label,
            action: 'REMOVED',
            performedById: userId,
          },
        });
      }
      if (wasActive) {
        const next = await tx.companyBankAccount.findFirst({
          orderBy: { createdAt: 'asc' },
        });
        if (next) {
          await tx.companyBankAccount.update({
            where: { id: next.id },
            data: { isActive: true, updatedById: userId ?? null },
          });
          if (userId) {
            await tx.companyBankAccountLog.create({
              data: {
                accountId: next.id,
                accountNumber: next.accountNumber,
                label: next.label,
                action: 'ACTIVATED',
                performedById: userId,
              },
            });
          }
        }
      }
    });
    return { success: true };
  }
}
