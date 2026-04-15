import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/enums.js';
import { CreateMachineDto } from './dto/create-machine.dto.js';
import { CreateProductionDto } from './dto/create-production.dto.js';
import { CreateShiftRecordDto } from './dto/create-shift-record.dto.js';
import { UpdateShiftRecordDto } from './dto/update-shift-record.dto.js';
import { ProductionService } from './production.service.js';

@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Post()
  @Roles(Role.DIRECTOR, Role.MANAGER, Role.WORKER)
  create(@Body() dto: CreateProductionDto) {
    return this.productionService.createProduction(dto);
  }

  @Get()
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT, Role.MANAGER, Role.WORKER)
  findAll() {
    return this.productionService.getProductions();
  }

  @Post('machines')
  @Roles(Role.DIRECTOR, Role.MANAGER)
  createMachine(@Body() dto: CreateMachineDto) {
    return this.productionService.createMachine(dto);
  }

  @Get('machines')
  @Roles(Role.DIRECTOR, Role.MANAGER, Role.WORKER)
  getMachines() {
    return this.productionService.getMachines();
  }

  @Patch('machines/:id/toggle')
  @Roles(Role.DIRECTOR, Role.MANAGER)
  toggleMachine(@Param('id') id: string) {
    return this.productionService.toggleMachine(id);
  }

  @Delete('machines/:id')
  @Roles(Role.DIRECTOR, Role.MANAGER)
  deleteMachine(@Param('id') id: string) {
    return this.productionService.deleteMachine(id);
  }

  @Post('shifts')
  @Roles(Role.DIRECTOR, Role.MANAGER, Role.WORKER)
  createShift(@Body() dto: CreateShiftRecordDto) {
    return this.productionService.createShiftRecord(dto);
  }

  @Get('shifts')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT, Role.MANAGER, Role.WORKER)
  getShifts() {
    return this.productionService.getShiftRecords();
  }

  @Patch('shifts/:id')
  @Roles(Role.DIRECTOR, Role.MANAGER, Role.WORKER)
  updateShift(@Param('id') id: string, @Body() dto: UpdateShiftRecordDto) {
    return this.productionService.updateShiftRecord(id, dto);
  }

  @Delete('shifts/:id')
  @Roles(Role.DIRECTOR, Role.MANAGER)
  deleteShift(@Param('id') id: string) {
    return this.productionService.deleteShiftRecord(id);
  }
}
