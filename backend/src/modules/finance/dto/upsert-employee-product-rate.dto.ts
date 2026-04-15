import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { EmployeeRateType } from '../../../generated/prisma/enums.js';

export class UpsertEmployeeProductRateDto {
  @IsString()
  workerId!: string;

  @IsString()
  productLabel!: string;

  @IsEnum(EmployeeRateType)
  rateType!: EmployeeRateType;

  @IsNumber()
  @Min(0)
  rateValue!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  baseAmount?: number;
}
