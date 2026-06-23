import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StatementNewClientDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  bankAccount?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  stir?: string;
}

export class StatementNewSupplierDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  bankAccount?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  stir?: string;
}

export class StatementNewCategoryDto {
  @IsString()
  @MinLength(1)
  name!: string;
}

export class ConfirmStatementRowDto {
  /** client_inflow — mijoz kirimi, kassa_inflow — bankdan kassaga, expense — chiqim */
  @IsIn(['client_inflow', 'kassa_inflow', 'expense'])
  mode!: 'client_inflow' | 'kassa_inflow' | 'expense';

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => StatementNewClientDto)
  newClient?: StatementNewClientDto;

  @IsOptional()
  @IsString()
  supplierId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => StatementNewSupplierDto)
  newSupplier?: StatementNewSupplierDto;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => StatementNewCategoryDto)
  newCategory?: StatementNewCategoryDto;

  @IsOptional()
  @IsString()
  fundingSourceId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsDateString()
  entryDate?: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
