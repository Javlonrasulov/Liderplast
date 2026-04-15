import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InventoryItemType } from '../../../generated/prisma/enums.js';

export class ProductRawMaterialInputDto {
  @IsString()
  @MinLength(1)
  rawMaterialId!: string;

  @IsNumber()
  @Min(0.01)
  amountGram!: number;
}

export class CreateProductDto {
  @IsEnum(InventoryItemType)
  itemType!: InventoryItemType;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weightGram?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  volumeLiter?: number;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductRawMaterialInputDto)
  rawMaterials?: ProductRawMaterialInputDto[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  semiProductIds?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  machineIds?: string[];
}
