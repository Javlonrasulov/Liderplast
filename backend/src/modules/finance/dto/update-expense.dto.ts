import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { PurchaseOrderCurrency } from '../../../generated/prisma/enums.js';

export class UpdateExpenseDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  categoryId?: string;

  /** Tanlangan valyutadagi summa */
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsEnum(PurchaseOrderCurrency)
  currency?: PurchaseOrderCurrency;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fxRateToUzs?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  incurredAt?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  fundingSourceId?: string;
}
