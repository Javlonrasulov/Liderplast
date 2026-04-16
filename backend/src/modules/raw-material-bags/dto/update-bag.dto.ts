import { IsString, MinLength } from 'class-validator';

export class UpdateBagDto {
  @IsString()
  @MinLength(1)
  name!: string;
}

