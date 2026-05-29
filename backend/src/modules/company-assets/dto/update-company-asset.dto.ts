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
} from '../../../generated/prisma/enums.js';

export class UpdateCompanyAssetDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

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

  @IsOptional()
  @IsISO8601()
  warrantyUntil?: string;

  @IsOptional()
  @IsString()
  assignedUserId?: string | null;

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
