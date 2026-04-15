import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateBagDto {
  @IsString()
  rawMaterialId!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsNumber()
  @Min(0.0001)
  initialQuantityKg!: number;
}
