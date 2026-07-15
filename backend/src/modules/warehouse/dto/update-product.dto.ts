import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  InventoryItemType,
  PurchaseOrderCurrency,
  type RawMaterialKind,
} from '../../../generated/prisma/enums.js';
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

  /** Faqat tayyor mahsulotlar uchun: 1 qopdagi dona */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  piecesPerBag?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.0001)
  defaultBagWeightKg?: number;

  @IsOptional()
  @IsIn(['SIRO', 'PAINT', 'PACKAGE'])
  rawMaterialKind?: RawMaterialKind;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  purchasePrice?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salePrice?: number | null;

  @IsOptional()
  @IsEnum(PurchaseOrderCurrency)
  priceCurrency?: PurchaseOrderCurrency | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fxRateToUzs?: number | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProductRelationsDto)
  relations?: ProductRelationsDto;
}
