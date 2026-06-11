import { IsEnum, IsOptional, IsString } from 'class-validator';
import { InventoryDocumentStatus } from '../../../generated/prisma/enums.js';

export class ListInventoryDocumentsDto {
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  warehouseId?: string;

  @IsOptional()
  @IsEnum(InventoryDocumentStatus)
  status?: InventoryDocumentStatus;

  @IsOptional()
  @IsString()
  docNumber?: string;
}
