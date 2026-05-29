import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/enums.js';
import { CompanyAssetsService } from './company-assets.service.js';
import { CreateCompanyAssetDto } from './dto/create-company-asset.dto.js';
import { UpdateCompanyAssetDto } from './dto/update-company-asset.dto.js';
import { ListCompanyAssetsDto } from './dto/list-company-assets.dto.js';
import { BulkCompanyAssetsDto } from './dto/bulk-company-assets.dto.js';

@Controller('company-assets')
export class CompanyAssetsController {
  constructor(private readonly companyAssetsService: CompanyAssetsService) {}

  @Get('stats')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT, Role.MANAGER)
  getStats() {
    return this.companyAssetsService.getStats();
  }

  @Get('filter-options')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT, Role.MANAGER)
  getFilterOptions() {
    return this.companyAssetsService.listFilterOptions();
  }

  @Get()
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT, Role.MANAGER)
  list(@Query() query: ListCompanyAssetsDto) {
    return this.companyAssetsService.list(query);
  }

  @Get(':id')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT, Role.MANAGER)
  getById(@Param('id') id: string) {
    return this.companyAssetsService.getById(id);
  }

  @Post()
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  create(
    @Body() dto: CreateCompanyAssetDto,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.companyAssetsService.create(dto, userId);
  }

  @Patch('bulk')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  bulkUpdate(
    @Body() dto: BulkCompanyAssetsDto,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.companyAssetsService.bulkUpdateStatus(dto, userId);
  }

  @Patch(':id')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyAssetDto,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.companyAssetsService.update(id, dto, userId);
  }

  @Delete(':id')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  remove(@Param('id') id: string, @CurrentUser('sub') userId?: string) {
    return this.companyAssetsService.remove(id, userId);
  }
}
