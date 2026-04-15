import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import {
  InventoryItemType,
  MovementType,
  Role,
} from '../../generated/prisma/enums.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { InventoryMovementDto } from './dto/inventory-movement.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { WarehouseService } from './warehouse.service.js';

@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post('products')
  @Roles(Role.ADMIN, Role.DIRECTOR)
  createProduct(
    @Body() dto: CreateProductDto,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.warehouseService.createProduct(dto, userId);
  }

  @Patch('products/:itemType/:id')
  @Roles(Role.ADMIN, Role.DIRECTOR)
  updateProduct(
    @Param('itemType', new ParseEnumPipe(InventoryItemType))
    itemType: InventoryItemType,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.warehouseService.updateProduct(itemType, id, dto, userId);
  }

  @Delete('products/:itemType/:id')
  @Roles(Role.ADMIN, Role.DIRECTOR)
  deleteProduct(
    @Param('itemType', new ParseEnumPipe(InventoryItemType))
    itemType: InventoryItemType,
    @Param('id') id: string,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.warehouseService.deleteProduct(itemType, id, userId);
  }

  @Post('incoming')
  @Roles(Role.DIRECTOR, Role.MANAGER, Role.WORKER)
  incoming(
    @Body() dto: InventoryMovementDto,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.warehouseService.createMovement(
      {
        ...dto,
        movementType: MovementType.INCOMING,
      },
      userId,
    );
  }

  @Post('consume')
  @Roles(Role.DIRECTOR, Role.MANAGER, Role.WORKER)
  consume(
    @Body() dto: InventoryMovementDto,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.warehouseService.createMovement(
      {
        ...dto,
        movementType: MovementType.CONSUMPTION,
      },
      userId,
    );
  }

  @Post('adjust')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT)
  adjust(
    @Body() dto: InventoryMovementDto,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.warehouseService.createMovement(
      {
        ...dto,
        movementType: dto.movementType ?? MovementType.ADJUSTMENT,
      },
      userId,
    );
  }

  @Get('stock')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT, Role.MANAGER, Role.WORKER)
  getStock() {
    return this.warehouseService.getStockSummary();
  }

  @Get('catalog')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT, Role.MANAGER, Role.WORKER)
  getCatalog() {
    return this.warehouseService.getCatalog();
  }

  @Get('history')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT, Role.MANAGER)
  getHistory() {
    return this.warehouseService.getHistory();
  }
}
