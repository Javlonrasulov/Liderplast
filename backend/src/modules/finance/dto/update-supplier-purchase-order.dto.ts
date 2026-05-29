import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import {
  PurchaseOrderCurrency,
  PurchasePaymentType,
  PurchaseQuantityUnit,
} from '../../../generated/prisma/enums.js';

export class UpdateSupplierPurchaseOrderDto {
  @IsOptional()
  @IsString()
  orderedAt?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  supplierId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.000_001)
  quantity?: number;

  @IsOptional()
  @IsEnum(PurchaseQuantityUnit)
  quantityUnit?: PurchaseQuantityUnit;

  @IsOptional()
  @IsEnum(PurchaseOrderCurrency)
  currency?: PurchaseOrderCurrency;

  @IsOptional()
  @IsNumber()
  @Min(0.000_001)
  fxRateToUzs?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amountOriginal?: number;

  @IsOptional()
  @IsEnum(PurchasePaymentType)
  paymentType?: PurchasePaymentType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmountUzs?: number;

  @IsOptional()
  @IsString()
  debtDueDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
