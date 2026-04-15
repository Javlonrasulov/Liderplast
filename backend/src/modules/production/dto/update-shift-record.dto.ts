import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateShiftRecordDto {
  @IsOptional()
  @IsString()
  workerId?: string;

  @IsOptional()
  @IsString()
  machineId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  shiftNumber?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hoursWorked?: number;

  @IsOptional()
  @IsString()
  productLabel?: string;

  @IsOptional()
  @IsString()
  machineReading?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  producedQty?: number;

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
