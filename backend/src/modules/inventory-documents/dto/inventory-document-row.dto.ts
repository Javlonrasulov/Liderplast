import { IsEnum, IsNumber, IsString, Min } from 'class-validator';
import { InventoryItemType } from '../../../generated/prisma/enums.js';

export class InventoryDocumentRowDto {
  @IsString()
  productId!: string;

  @IsString()
  productName!: string;

  @IsEnum(InventoryItemType)
  category!: InventoryItemType;

  @IsString()
  unit!: 'kg' | 'pcs';

  @IsNumber()
  systemQuantityStart!: number;

  @IsNumber()
  realQuantityStart!: number;

  @IsNumber()
  @Min(0)
  income!: number;

  @IsNumber()
  @Min(0)
  expense!: number;

  @IsNumber()
  systemQuantityEnd!: number;

  @IsNumber()
  realQuantityEnd!: number;
}
