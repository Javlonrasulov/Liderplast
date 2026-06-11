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
import { CreateInventoryDocumentDto } from './dto/create-inventory-document.dto.js';
import { ListInventoryDocumentsDto } from './dto/list-inventory-documents.dto.js';
import { UpdateInventoryDocumentDto } from './dto/update-inventory-document.dto.js';
import { InventoryDocumentsService } from './inventory-documents.service.js';

@Controller('inventory/documents')
export class InventoryDocumentsController {
  constructor(
    private readonly inventoryDocumentsService: InventoryDocumentsService,
  ) {}

  @Get()
  @Roles(Role.ADMIN, Role.DIRECTOR, Role.ACCOUNTANT)
  list(@Query() query: ListInventoryDocumentsDto) {
    return this.inventoryDocumentsService.list(query);
  }

  @Get('next-doc-number')
  @Roles(Role.ADMIN, Role.DIRECTOR, Role.ACCOUNTANT)
  nextDocNumber() {
    return this.inventoryDocumentsService.nextDocNumber();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DIRECTOR, Role.ACCOUNTANT)
  getById(@Param('id') id: string) {
    return this.inventoryDocumentsService.getById(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.DIRECTOR, Role.ACCOUNTANT)
  create(
    @Body() dto: CreateInventoryDocumentDto,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.inventoryDocumentsService.create(dto, userId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.DIRECTOR, Role.ACCOUNTANT)
  update(@Param('id') id: string, @Body() dto: UpdateInventoryDocumentDto) {
    return this.inventoryDocumentsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.DIRECTOR, Role.ACCOUNTANT)
  remove(@Param('id') id: string) {
    return this.inventoryDocumentsService.remove(id);
  }
}
