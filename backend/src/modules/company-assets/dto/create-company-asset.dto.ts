import {
  IsEnum,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import {
  CompanyAssetCategory,
  CompanyAssetCondition,
  CompanyAssetStatus,
  PurchaseOrderCurrency,
} from '../../../generated/prisma/enums.js';

export class CreateCompanyAssetDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  inventoryNumber?: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsEnum(CompanyAssetCategory)
  category?: CompanyAssetCategory;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsISO8601()
  purchasedAt?: string;

  @IsNumber()
  @Min(0)
  purchasePriceOriginal!: number;

  @IsEnum(PurchaseOrderCurrency)
  currency!: PurchaseOrderCurrency;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fxRateToUzs?: number;

  @IsOptional()
  @IsISO8601()
  warrantyUntil?: string;

  @IsOptional()
  @IsString()
  assignedUserId?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(CompanyAssetCondition)
  condition?: CompanyAssetCondition;

  @IsOptional()
  @IsEnum(CompanyAssetStatus)
  status?: CompanyAssetStatus;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  documents?: { fileName: string; fileUrl: string }[];
}
