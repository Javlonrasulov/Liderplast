import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CompanyAssetDocumentDto } from './company-asset-document.dto.js';
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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompanyAssetDocumentDto)
  documents?: CompanyAssetDocumentDto[];
}
