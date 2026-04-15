import { IsDateString, IsOptional, IsString } from 'class-validator';

export class WriteoffBagDto {
  @IsString()
  bagId!: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsDateString()
  writtenOffAt?: string;
}
