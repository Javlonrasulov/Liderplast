import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BagStatus } from '../../../generated/prisma/enums.js';

export class ListBagsDto {
  @IsOptional()
  @IsString()
  rawMaterialId?: string;

  @IsOptional()
  @IsEnum(BagStatus)
  status?: BagStatus;
}
