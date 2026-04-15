import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  EntityStatus,
  Role,
  SalaryType,
} from '../../generated/prisma/enums.js';
import { CreateEmployeeProductionDto } from './dto/create-employee-production.dto.js';
import { CreateExpenseDto } from './dto/create-expense.dto.js';
import { GenerateSalaryDto } from './dto/generate-salary.dto.js';
import { SetMonthPaidDto } from './dto/set-month-paid.dto.js';
import { UpdateSalarySettingsDto } from './dto/update-salary-settings.dto.js';
import { UpdateSalaryRecordDto } from './dto/update-salary-record.dto.js';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  createExpense(dto: CreateExpenseDto, createdById?: string) {
    return this.prisma.expense.create({
      data: {
        ...dto,
        createdById,
      },
    });
  }

  getExpenses() {
    return this.prisma.expense.findMany({
      include: {
        createdBy: {
          omit: { passwordHash: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  createEmployeeProduction(dto: CreateEmployeeProductionDto) {
    return this.prisma.employeeProduction.create({
      data: {
        workerId: dto.workerId,
        productLabel: dto.productLabel,
        quantity: dto.quantity,
        rate: dto.rate,
        totalAmount: dto.quantity * dto.rate,
        producedAt: new Date(dto.producedAt),
      },
    });
  }

  async deleteEmployeeProduction(id: string) {
    const item = await this.prisma.employeeProduction.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Employee production not found');
    }

    await this.prisma.employeeProduction.delete({
      where: { id },
    });

    return { success: true };
  }

  getEmployeeProductions(currentUserId?: string, currentUserRole?: Role) {
    return this.prisma.employeeProduction.findMany({
      where:
        currentUserRole === Role.WORKER
          ? { workerId: currentUserId }
          : undefined,
      include: {
        worker: {
          omit: { passwordHash: true },
        },
      },
      orderBy: { producedAt: 'desc' },
    });
  }

  async updateSalarySettings(dto: UpdateSalarySettingsDto) {
    const existing = await this.prisma.salarySetting.findFirst();

    if (!existing) {
      return this.prisma.salarySetting.create({ data: dto });
    }

    return this.prisma.salarySetting.update({
      where: { id: existing.id },
      data: dto,
    });
  }

  getSalarySettings() {
    return this.prisma.salarySetting.findFirst();
  }

  async generateSalary(dto: GenerateSalaryDto) {
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
      const productions = await this.prisma.employeeProduction.findMany({
        where: {
          workerId: worker.id,
          producedAt: {
            gte: new Date(`${dto.month}-01T00:00:00.000Z`),
            lt: new Date(`${dto.month}-31T23:59:59.999Z`),
          },
        },
      });

      const producedQuantity = productions.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      const productionAmount = productions.reduce(
        (sum, item) => sum + item.totalAmount,
        0,
      );

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
          workedDays: 26,
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
        create: {
          workerId: worker.id,
          month: dto.month,
          workedDays: 26,
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
          omit: { passwordHash: true },
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
          omit: { passwordHash: true },
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
          omit: { passwordHash: true },
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
          omit: { passwordHash: true },
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
}
