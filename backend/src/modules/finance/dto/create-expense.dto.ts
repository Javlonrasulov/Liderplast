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

export class CreateExpenseDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @MinLength(1)
  categoryId!: string;

  /** Tanlangan valyutadagi summa (UZS yoki USD) */
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsEnum(PurchaseOrderCurrency)
  currency?: PurchaseOrderCurrency;

  /** 1 USD = necha so‘m; UZS uchun 1 */
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

  @IsString()
  @MinLength(1)
  fundingSourceId!: string;
}
