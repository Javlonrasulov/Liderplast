import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  InventoryItemType,
  ProductionStage,
} from '../../../generated/prisma/enums.js';

class ProductionConsumptionDto {
  @IsEnum(InventoryItemType)
  itemType!: InventoryItemType;

  @IsOptional()
  @IsString()
  rawMaterialId?: string;

  @IsOptional()
  @IsString()
  semiProductId?: string;

  @IsNumber()
  @Min(0.0001)
  quantity!: number;
}

export class CreateProductionDto {
  @IsEnum(ProductionStage)
  stage!: ProductionStage;

  @IsString()
  workerId!: string;

  @IsOptional()
  @IsString()
  machineId?: string;

  @IsOptional()
  @IsString()
  outputSemiProductId?: string;

  @IsOptional()
  @IsString()
  outputFinishedProductId?: string;

  @IsNumber()
  @Min(0.0001)
  quantityProduced!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  waste?: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductionConsumptionDto)
  consumptions!: ProductionConsumptionDto[];
}
