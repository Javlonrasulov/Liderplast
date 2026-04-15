import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Role, SalaryType } from '../../../generated/prisma/enums.js';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  fullName!: string;

  @IsPhoneNumber('UZ')
  phone!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsEnum(SalaryType)
  salaryType?: SalaryType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryRate?: number;
}
