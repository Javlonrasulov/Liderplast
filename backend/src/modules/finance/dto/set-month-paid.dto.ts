import { IsBoolean, IsString, Matches } from 'class-validator';

export class SetMonthPaidDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}$/)
  month!: string;

  @IsBoolean()
  isPaid!: boolean;
}
