import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateShiftRecordDto {
  @IsString()
  workerId!: string;

  @IsOptional()
  @IsString()
  machineId?: string;

  @IsInt()
  @Min(1)
  @Max(20)
  shiftNumber!: number;

  @IsDateString()
  date!: string;

  @IsNumber()
  @Min(0)
  hoursWorked!: number;

  @IsOptional()
  @IsString()
  productLabel?: string;

  @IsOptional()
  @IsString()
  machineReading?: string;

  @IsInt()
  @Min(0)
  producedQty!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  defectCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  electricityKwh?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
