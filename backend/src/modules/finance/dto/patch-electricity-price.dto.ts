import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class PatchElectricityPriceDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  electricityPricePerKwh!: number;
}
