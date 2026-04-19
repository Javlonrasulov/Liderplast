import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { PurchaseOrderCurrency } from '../../../generated/prisma/enums.js';

export class CreateRawMaterialPurchaseOrderDto {
  @IsString()
  @MinLength(1)
  rawMaterialId!: string;

  /** Har doim kg (tonna bo‘lsa frontend 1000 ga ko‘paytiradi) */
  @IsNumber()
  @Min(0.0001)
  quantityKg!: number;

  @IsEnum(PurchaseOrderCurrency)
  currency!: PurchaseOrderCurrency;

  /** 1 USD/EUR = necha so‘m (CBU). UZS uchun 1 */
  @IsNumber()
  @Min(0)
  fxRateToUzs!: number;

  /** Tanlangan valyutadagi jami */
  @IsNumber()
  @Min(0)
  amountOriginal!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
