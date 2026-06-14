import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateExpenseFundingSourceDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;
}
