import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { ProductionStage } from '../../../generated/prisma/enums.js';

export class CreateMachineDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ProductionStage)
  stage!: ProductionStage;

  @IsNumber()
  @Min(0)
  powerKw!: number;

  @IsNumber()
  @Min(0)
  maxCapacityPerHour!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
