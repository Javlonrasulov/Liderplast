import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import {
  InventoryItemType,
  MovementType,
} from '../../../generated/prisma/enums.js';

export class InventoryMovementDto {
  @IsEnum(InventoryItemType)
  itemType!: InventoryItemType;

  @IsEnum(MovementType)
  movementType!: MovementType;

  @IsOptional()
  @IsString()
  rawMaterialId?: string;

  @IsOptional()
  @IsString()
  semiProductId?: string;

  @IsOptional()
  @IsString()
  finishedProductId?: string;

  @IsNumber()
  @Min(0.0001)
  quantity!: number;

  @IsOptional()
  @IsString()
  note?: string;
}
