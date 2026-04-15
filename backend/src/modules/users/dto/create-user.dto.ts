import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Role, SalaryType } from '../../../generated/prisma/enums.js';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  fullName!: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  cardNumber?: string;

  @IsOptional()
  @IsString()
  stir?: string;

  @IsOptional()
  @IsPhoneNumber('UZ')
  phone?: string;

  /** Username (login); ixtiyoriy, telefon bilan birga bo‘lishi mumkin */
  @IsOptional()
  @IsString()
  @MinLength(2)
  login?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  customRoleLabel?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @IsOptional()
  @IsBoolean()
  canLogin?: boolean;

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

  @IsOptional()
  @IsInt()
  @Min(1)
  preferredShiftNumber?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
