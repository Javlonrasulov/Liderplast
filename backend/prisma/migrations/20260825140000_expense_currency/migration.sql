-- Xarajat: valyuta + kurs + asl summa (amount har doim so‘m)
ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "currency" "PurchaseOrderCurrency" NOT NULL DEFAULT 'UZS';
ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "fxRateToUzs" DOUBLE PRECISION NOT NULL DEFAULT 1;
ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "amountOriginal" DOUBLE PRECISION;

UPDATE "Expense"
SET "amountOriginal" = "amount"
WHERE "amountOriginal" IS NULL;
