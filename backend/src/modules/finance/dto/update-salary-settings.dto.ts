import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpdateSalarySettingsDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  incomeTaxPercent!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  otherDeductionPercent!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  socialTaxPercent!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  npsPercent!: number;

  /** kVt·soat narxi (so‘m) — smena elektr xarajati */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  electricityPricePerKwh?: number;
}
