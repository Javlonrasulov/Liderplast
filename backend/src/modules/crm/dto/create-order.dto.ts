import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  OrderProductType,
  OrderStatus,
  PurchaseOrderCurrency,
} from '../../../generated/prisma/enums.js';

class CreateOrderItemDto {
  @IsEnum(OrderProductType)
  productType!: OrderProductType;

  @IsOptional()
  @IsString()
  semiProductId?: string;

  @IsOptional()
  @IsString()
  finishedProductId?: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsEnum(PurchaseOrderCurrency)
  currency?: PurchaseOrderCurrency;

  /** UZS bo‘lmagan valyuta uchun MB kursi */
  @IsOptional()
  @IsNumber()
  @Min(0)
  fxRateToUzs?: number;
}

export class CreateOrderDto {
  @IsString()
  clientId!: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  /** YYYY-MM-DD — sotuv sanasi */
  @IsOptional()
  @IsDateString()
  orderedAt?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
