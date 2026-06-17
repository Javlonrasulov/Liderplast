import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateKassaOutflowDto {
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsDateString()
  entryDate?: string;
}
