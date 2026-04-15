import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class SemiProductRawMaterialInputDto {
  @IsString()
  rawMaterialId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amountGram!: number;
}

export class ProductRelationsDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SemiProductRawMaterialInputDto)
  rawMaterials?: SemiProductRawMaterialInputDto[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  semiProductIds?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  machineIds?: string[];
}
