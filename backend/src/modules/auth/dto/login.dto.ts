import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  /** Telefon yoki `login` (username) */
  @IsString()
  @MinLength(3)
  identifier!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
