import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/enums.js';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto.js';
import { CreateExpenseDto } from './dto/create-expense.dto.js';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto.js';
import { GenerateSalaryDto } from './dto/generate-salary.dto.js';
import { SetMonthPaidDto } from './dto/set-month-paid.dto.js';
import { UpsertEmployeeProductRateDto } from './dto/upsert-employee-product-rate.dto.js';
import { PatchElectricityPriceDto } from './dto/patch-electricity-price.dto.js';
import { UpdateSalarySettingsDto } from './dto/update-salary-settings.dto.js';
import { UpdateSalaryRecordDto } from './dto/update-salary-record.dto.js';
import { FinanceService } from './finance.service.js';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('expenses')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  createExpense(
    @Body() dto: CreateExpenseDto,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.financeService.createExpense(dto, userId);
  }

  @Get('expenses/categories')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  getExpenseCategories() {
    return this.financeService.getExpenseCategories();
  }

  @Post('expenses/categories')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  createExpenseCategory(@Body() dto: CreateExpenseCategoryDto) {
    return this.financeService.createExpenseCategory(dto);
  }

  @Patch('expenses/categories/:id')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  updateExpenseCategory(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseCategoryDto,
  ) {
    return this.financeService.updateExpenseCategory(id, dto);
  }

  @Delete('expenses/categories/:id')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  deleteExpenseCategory(@Param('id') id: string) {
    return this.financeService.deleteExpenseCategory(id);
  }

  @Get('expenses')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  getExpenses() {
    return this.financeService.getExpenses();
  }

  /** @deprecated — ikkala URL ham qo‘llab-quvvatlanadi (proxy / eski mijozlar) */
  @Get('expense-categories')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  getExpenseCategoriesLegacy() {
    return this.financeService.getExpenseCategories();
  }

  @Post('expense-categories')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  createExpenseCategoryLegacy(@Body() dto: CreateExpenseCategoryDto) {
    return this.financeService.createExpenseCategory(dto);
  }

  @Patch('expense-categories/:id')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  updateExpenseCategoryLegacy(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseCategoryDto,
  ) {
    return this.financeService.updateExpenseCategory(id, dto);
  }

  @Delete('expense-categories/:id')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  deleteExpenseCategoryLegacy(@Param('id') id: string) {
    return this.financeService.deleteExpenseCategory(id);
  }

  @Get('employee-product-rates')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT, Role.MANAGER, Role.WORKER)
  getEmployeeProductRates() {
    return this.financeService.getEmployeeProductRates();
  }

  @Put('employee-product-rates')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  upsertEmployeeProductRate(@Body() dto: UpsertEmployeeProductRateDto) {
    return this.financeService.upsertEmployeeProductRate(dto);
  }

  @Delete('employee-product-rates/:workerId/:productLabel')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  deleteEmployeeProductRate(
    @Param('workerId') workerId: string,
    @Param('productLabel') productLabel: string,
  ) {
    return this.financeService.deleteEmployeeProductRate(workerId, decodeURIComponent(productLabel));
  }

  @Put('salary-settings')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  updateSalarySettings(@Body() dto: UpdateSalarySettingsDto) {
    return this.financeService.updateSalarySettings(dto);
  }

  /** Faqat kVt·soat narxi (xarajatlar sahifasi) — soliq maydonlari yuborilmaydi */
  @Patch('salary-settings/electricity-price')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  patchElectricityPrice(@Body() dto: PatchElectricityPriceDto) {
    return this.financeService.patchElectricityPricePerKwh(dto.electricityPricePerKwh);
  }

  @Get('salary-settings')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT, Role.MANAGER)
  getSalarySettings() {
    return this.financeService.getSalarySettings();
  }

  @Post('salary/generate')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  generateSalary(@Body() dto: GenerateSalaryDto) {
    return this.financeService.generateSalary(dto);
  }

  @Get('salary')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT, Role.WORKER)
  getSalaryRecords(
    @CurrentUser('sub') userId?: string,
    @CurrentUser('role') role?: Role,
  ) {
    return this.financeService.getSalaryRecords(userId, role);
  }

  @Get('salary/:id')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT, Role.WORKER)
  getSalaryRecord(
    @Param('id') id: string,
    @CurrentUser('sub') userId?: string,
    @CurrentUser('role') role?: Role,
  ) {
    return this.financeService.getSalaryRecordById(id, userId, role);
  }

  @Patch('salary/:id')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  updateSalaryRecord(
    @Param('id') id: string,
    @Body() dto: UpdateSalaryRecordDto,
  ) {
    return this.financeService.updateSalaryRecord(id, dto);
  }

  @Post('salary/month-status')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  setMonthPaidStatus(@Body() dto: SetMonthPaidDto) {
    return this.financeService.setMonthPaidStatus(dto);
  }

  @Post('upload-oborotka')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  @UseInterceptors(FileInterceptor('file'))
  uploadOborotka(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.financeService.uploadOborotka(file, userId);
  }

  @Get('vedomosts')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  getBankVedomosts() {
    return this.financeService.getBankVedomosts();
  }

  @Get('vedomost/:id')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  getBankVedomost(@Param('id') id: string) {
    return this.financeService.getBankVedomostById(id);
  }

  @Get('salary-vedomost')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  getSalaryVedomostSummary(@Query('month') month?: string) {
    return this.financeService.getSalaryVedomostSummary(month);
  }

  @Post('transactions/:id/create-employee')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  createEmployeeFromTransaction(@Param('id') id: string) {
    return this.financeService.createEmployeeFromTransaction(id);
  }

  @Post('transactions/:id/create-client')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  createClientFromTransaction(@Param('id') id: string) {
    return this.financeService.createClientFromTransaction(id);
  }

  @Post('vedomost/:id/reconcile')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  reconcileBankVedomost(@Param('id') id: string) {
    return this.financeService.reconcileBankVedomost(id);
  }
}
