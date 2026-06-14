import { IsString, MinLength } from 'class-validator';

export class CreateExpenseFundingSourceDto {
  @IsString()
  @MinLength(1)
  name!: string;
}
