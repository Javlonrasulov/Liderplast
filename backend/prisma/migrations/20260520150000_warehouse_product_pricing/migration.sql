-- AlterTable
ALTER TABLE "RawMaterial" ADD COLUMN "purchasePrice" DOUBLE PRECISION,
ADD COLUMN "salePrice" DOUBLE PRECISION,
ADD COLUMN "priceCurrency" "PurchaseOrderCurrency",
ADD COLUMN "fxRateToUzs" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "SemiProduct" ADD COLUMN "purchasePrice" DOUBLE PRECISION,
ADD COLUMN "salePrice" DOUBLE PRECISION,
ADD COLUMN "priceCurrency" "PurchaseOrderCurrency",
ADD COLUMN "fxRateToUzs" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "FinishedProduct" ADD COLUMN "purchasePrice" DOUBLE PRECISION,
ADD COLUMN "salePrice" DOUBLE PRECISION,
ADD COLUMN "priceCurrency" "PurchaseOrderCurrency",
ADD COLUMN "fxRateToUzs" DOUBLE PRECISION;
