import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import {
  CompanyAssetCategory,
  CompanyAssetStatus,
} from '../../../generated/prisma/enums.js';

export class ListCompanyAssetsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  inventorySearch?: string;

  @IsOptional()
  @IsEnum(CompanyAssetStatus)
  status?: CompanyAssetStatus;

  /** Vergul bilan: ACTIVE,NEEDS_REPAIR */
  @IsOptional()
  @IsString()
  statuses?: string;

  @IsOptional()
  @IsEnum(CompanyAssetCategory)
  category?: CompanyAssetCategory;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  assignedUserId?: string;
}
