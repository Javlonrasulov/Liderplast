import { ArrayMinSize, IsArray, IsEnum, IsString } from 'class-validator';
import { CompanyAssetStatus } from '../../../generated/prisma/enums.js';

export class BulkCompanyAssetsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ids!: string[];

  @IsEnum(CompanyAssetStatus)
  status!: CompanyAssetStatus;
}
