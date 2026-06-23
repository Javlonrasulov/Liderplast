import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCompanyBankAccountDto {
  @IsString()
  @MinLength(3)
  accountNumber!: string;

  @IsOptional()
  @IsString()
  label?: string;
}
