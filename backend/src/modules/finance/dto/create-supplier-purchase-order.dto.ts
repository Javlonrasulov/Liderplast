import {
  IsEnum,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import {
  InventoryItemType,
  PurchaseOrderCurrency,
  PurchasePaymentType,
  PurchaseQuantityUnit,
} from '../../../generated/prisma/enums.js';

export class CreateSupplierPurchaseOrderDto {
  @IsString()
  @MinLength(1)
  supplierId!: string;

  @IsEnum(InventoryItemType)
  itemType!: InventoryItemType;

  @ValidateIf((o) => o.itemType === InventoryItemType.RAW_MATERIAL)
  @IsString()
  @MinLength(1)
  rawMaterialId?: string;

  @ValidateIf((o) => o.itemType === InventoryItemType.SEMI_PRODUCT)
  @IsString()
  @MinLength(1)
  semiProductId?: string;

  @ValidateIf((o) => o.itemType === InventoryItemType.FINISHED_PRODUCT)
  @IsString()
  @MinLength(1)
  finishedProductId?: string;

  @IsNumber()
  @Min(0.0001)
  quantity!: number;

  @IsEnum(PurchaseQuantityUnit)
  quantityUnit!: PurchaseQuantityUnit;

  @IsEnum(PurchaseOrderCurrency)
  currency!: PurchaseOrderCurrency;

  @IsNumber()
  @Min(0)
  fxRateToUzs!: number;

  @IsNumber()
  @Min(0)
  amountOriginal!: number;

  @IsEnum(PurchasePaymentType)
  paymentType!: PurchasePaymentType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmountUzs?: number;

  @IsOptional()
  @IsISO8601()
  debtDueDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  /** YYYY-MM-DD */
  @IsOptional()
  @IsString()
  orderedAt?: string;
}
