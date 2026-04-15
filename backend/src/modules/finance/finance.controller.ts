import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/enums.js';
import { CreateEmployeeProductionDto } from './dto/create-employee-production.dto.js';
import { CreateExpenseDto } from './dto/create-expense.dto.js';
import { GenerateSalaryDto } from './dto/generate-salary.dto.js';
import { SetMonthPaidDto } from './dto/set-month-paid.dto.js';
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

  @Get('expenses')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  getExpenses() {
    return this.financeService.getExpenses();
  }

  @Post('employee-productions')
  @Roles(Role.DIRECTOR, Role.MANAGER, Role.WORKER)
  createEmployeeProduction(@Body() dto: CreateEmployeeProductionDto) {
    return this.financeService.createEmployeeProduction(dto);
  }

  @Get('employee-productions')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT, Role.MANAGER, Role.WORKER)
  getEmployeeProductions(
    @CurrentUser('sub') userId?: string,
    @CurrentUser('role') role?: Role,
  ) {
    return this.financeService.getEmployeeProductions(userId, role);
  }

  @Delete('employee-productions/:id')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT, Role.MANAGER)
  deleteEmployeeProduction(@Param('id') id: string) {
    return this.financeService.deleteEmployeeProduction(id);
  }

  @Put('salary-settings')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  updateSalarySettings(@Body() dto: UpdateSalarySettingsDto) {
    return this.financeService.updateSalarySettings(dto);
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
}
