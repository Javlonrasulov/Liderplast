import { IsOptional, IsString } from 'class-validator';

export class UploadFileQueryDto {
  @IsOptional()
  @IsString()
  source?: string;
}
