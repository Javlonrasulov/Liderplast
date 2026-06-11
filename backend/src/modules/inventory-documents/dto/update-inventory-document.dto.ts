import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { InventoryDocumentStatus } from '../../../generated/prisma/enums.js';
import { InventoryDocumentRowDto } from './inventory-document-row.dto.js';

export class UpdateInventoryDocumentDto {
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @IsOptional()
  @IsString()
  warehouseName?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsOptional()
  @IsEnum(InventoryDocumentStatus)
  status?: InventoryDocumentStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  expenseIds?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryDocumentRowDto)
  rows?: InventoryDocumentRowDto[];

  @IsOptional()
  @IsString()
  finishedAt?: string | null;
}
