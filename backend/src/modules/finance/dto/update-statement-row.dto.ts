import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateStatementRowDto {
  @IsOptional()
  @IsIn(['income', 'expense'])
  type?: 'income' | 'expense';

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsDateString()
  operationDate?: string;

  @IsOptional()
  @IsString()
  documentNumber?: string;

  @IsOptional()
  @IsString()
  receiverName?: string;

  @IsOptional()
  @IsString()
  receiverAccount?: string;

  @IsOptional()
  @IsString()
  receiverBankCode?: string;

  @IsOptional()
  @IsString()
  receiverBankName?: string;

  @IsOptional()
  @IsString()
  receiverStir?: string;

  @IsOptional()
  @IsString()
  paymentPurpose?: string;

  @IsOptional()
  @IsString()
  companyAccount?: string;

  @IsOptional()
  @IsString()
  companyBankName?: string;

  @IsOptional()
  @IsString()
  companyStir?: string;
}
