import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { ExpenseType } from '../../../generated/prisma/enums.js';

export class CreateExpenseDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsEnum(ExpenseType)
  type!: ExpenseType;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  description?: string;
}
