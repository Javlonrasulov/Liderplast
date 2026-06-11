import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { InventoryDocumentStatus } from '../../../generated/prisma/enums.js';
import { InventoryDocumentRowDto } from './inventory-document-row.dto.js';

export class CreateInventoryDocumentDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  docNumber?: string;

  @IsString()
  warehouseId!: string;

  @IsString()
  warehouseName!: string;

  @IsString()
  dateFrom!: string;

  @IsString()
  dateTo!: string;

  @IsOptional()
  @IsEnum(InventoryDocumentStatus)
  status?: InventoryDocumentStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  expenseIds?: string[];

  @IsOptional()
  @IsString()
  finishedAt?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryDocumentRowDto)
  rows!: InventoryDocumentRowDto[];
}
