import { IsDateString, IsInt, IsNumber, IsString, Min } from 'class-validator';

export class CreateEmployeeProductionDto {
  @IsString()
  workerId!: string;

  @IsString()
  productLabel!: string;

  @IsInt()
  @Min(0)
  quantity!: number;

  @IsNumber()
  @Min(0)
  rate!: number;

  @IsDateString()
  producedAt!: string;
}
