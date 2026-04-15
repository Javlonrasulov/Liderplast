import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { InventoryItemType } from '../../../generated/prisma/enums.js';
import { ProductRelationsDto } from './product-relations.dto.js';

export class UpdateProductDto {
  @IsOptional()
  @IsEnum(InventoryItemType)
  itemType?: InventoryItemType;

  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  weightGram?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  volumeLiter?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProductRelationsDto)
  relations?: ProductRelationsDto;
}
