import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateKassaBankInflowDto {
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
