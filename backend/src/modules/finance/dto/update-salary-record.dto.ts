import { IsBoolean, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateSalaryRecordDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  bonus?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  workedDays?: number;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;
}
