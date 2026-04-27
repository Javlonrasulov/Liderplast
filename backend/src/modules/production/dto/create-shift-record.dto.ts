import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class RawMaterialActualKgDto {
  @IsString()
  rawMaterialId!: string;

  @IsNumber()
  @Min(0.000001)
  quantityKg!: number;
}

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

  /** Yarim tayyor smena: kraska/bo‘yoq ishlatilganmi */
  @IsOptional()
  @IsBoolean()
  paintUsed?: boolean;

  @ValidateIf((o) => o.paintUsed === true)
  @IsString()
  paintRawMaterialId?: string;

  /** kg (frontend gr ni kg ga aylantiradi) */
  @ValidateIf((o) => o.paintUsed === true)
  @IsNumber()
  @Min(0.000001)
  paintQuantityKg?: number;

  /** Qolip smenasi: retseptdan tashqari siro (kg) — har хомашё учун */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RawMaterialActualKgDto)
  rawMaterialActualKg?: RawMaterialActualKgDto[];
}
