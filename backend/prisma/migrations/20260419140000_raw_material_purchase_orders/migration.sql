-- CreateEnum
CREATE TYPE "RawMaterialOrderStatus" AS ENUM ('PENDING', 'FULFILLED');

-- CreateEnum
CREATE TYPE "PurchaseOrderCurrency" AS ENUM ('UZS', 'USD', 'EUR');

-- CreateTable
CREATE TABLE "RawMaterialPurchaseOrder" (
    "id" TEXT NOT NULL,
    "rawMaterialId" TEXT NOT NULL,
    "quantityKg" DOUBLE PRECISION NOT NULL,
    "currency" "PurchaseOrderCurrency" NOT NULL,
    "fxRateToUzs" DOUBLE PRECISION NOT NULL,
    "amountOriginal" DOUBLE PRECISION NOT NULL,
    "amountUzs" DOUBLE PRECISION NOT NULL,
    "expenseId" TEXT NOT NULL,
    "status" "RawMaterialOrderStatus" NOT NULL DEFAULT 'PENDING',
    "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fulfilledAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdById" TEXT,

    CONSTRAINT "RawMaterialPurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RawMaterialPurchaseOrder_expenseId_key" ON "RawMaterialPurchaseOrder"("expenseId");

-- CreateIndex
CREATE INDEX "RawMaterialPurchaseOrder_status_orderedAt_idx" ON "RawMaterialPurchaseOrder"("status", "orderedAt");

-- CreateIndex
CREATE INDEX "RawMaterialPurchaseOrder_rawMaterialId_idx" ON "RawMaterialPurchaseOrder"("rawMaterialId");

-- AddForeignKey
ALTER TABLE "RawMaterialPurchaseOrder" ADD CONSTRAINT "RawMaterialPurchaseOrder_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialPurchaseOrder" ADD CONSTRAINT "RawMaterialPurchaseOrder_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialPurchaseOrder" ADD CONSTRAINT "RawMaterialPurchaseOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "ExpenseCategory" ("id", "name", "legacyExpenseType", "electricityCalc", "deletedAt", "createdAt")
VALUES ('expseed_raw_material_orders', 'Xom ashyo tashqi buyurtma', 'OTHER', false, NULL, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
