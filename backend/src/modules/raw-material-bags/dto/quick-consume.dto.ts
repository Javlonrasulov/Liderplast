import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class QuickConsumeDto {
  @IsOptional()
  @IsString()
  rawMaterialId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.0001)
  quantityKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  pieceCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.0001)
  gramPerUnit?: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  referenceType?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsDateString()
  consumedAt?: string;
}
