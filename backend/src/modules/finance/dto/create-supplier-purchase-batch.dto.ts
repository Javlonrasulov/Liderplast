import { Type } from 'class-transformer';
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
import { PurchasePaymentType } from '../../../generated/prisma/enums.js';
import { SupplierPurchaseBatchItemDto } from './supplier-purchase-batch-item.dto.js';

export class CreateSupplierPurchaseBatchDto {
  @IsString()
  @MinLength(1)
  supplierId!: string;

  @IsEnum(PurchasePaymentType)
  paymentType!: PurchasePaymentType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmountUzs?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SupplierPurchaseBatchItemDto)
  items!: SupplierPurchaseBatchItemDto[];
}
