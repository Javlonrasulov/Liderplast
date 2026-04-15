import { IsNumber, Max, Min } from 'class-validator';

export class UpdateSalarySettingsDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  incomeTaxPercent!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  otherDeductionPercent!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  socialTaxPercent!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  npsPercent!: number;
}
