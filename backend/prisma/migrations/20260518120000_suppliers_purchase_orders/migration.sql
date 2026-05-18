-- CreateEnum
CREATE TYPE "PurchaseQuantityUnit" AS ENUM ('KG', 'TON', 'PIECES');

-- CreateEnum
CREATE TYPE "PurchasePaymentType" AS ENUM ('CASH', 'CREDIT');

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierPurchaseOrder" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "itemType" "InventoryItemType" NOT NULL,
    "rawMaterialId" TEXT,
    "semiProductId" TEXT,
    "finishedProductId" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "quantityUnit" "PurchaseQuantityUnit" NOT NULL,
    "currency" "PurchaseOrderCurrency" NOT NULL,
    "fxRateToUzs" DOUBLE PRECISION NOT NULL,
    "amountOriginal" DOUBLE PRECISION NOT NULL,
    "amountUzs" DOUBLE PRECISION NOT NULL,
    "paymentType" "PurchasePaymentType" NOT NULL DEFAULT 'CASH',
    "paidAmountUzs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "debtAmountUzs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "debtDueDate" TIMESTAMP(3),
    "expenseId" TEXT NOT NULL,
    "status" "RawMaterialOrderStatus" NOT NULL DEFAULT 'PENDING',
    "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fulfilledAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdById" TEXT,

    CONSTRAINT "SupplierPurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Supplier_isDeleted_name_idx" ON "Supplier"("isDeleted", "name");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierPurchaseOrder_expenseId_key" ON "SupplierPurchaseOrder"("expenseId");

-- CreateIndex
CREATE INDEX "SupplierPurchaseOrder_status_orderedAt_idx" ON "SupplierPurchaseOrder"("status", "orderedAt");

-- CreateIndex
CREATE INDEX "SupplierPurchaseOrder_supplierId_idx" ON "SupplierPurchaseOrder"("supplierId");

-- CreateIndex
CREATE INDEX "SupplierPurchaseOrder_itemType_idx" ON "SupplierPurchaseOrder"("itemType");

-- AddForeignKey
ALTER TABLE "SupplierPurchaseOrder" ADD CONSTRAINT "SupplierPurchaseOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierPurchaseOrder" ADD CONSTRAINT "SupplierPurchaseOrder_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierPurchaseOrder" ADD CONSTRAINT "SupplierPurchaseOrder_semiProductId_fkey" FOREIGN KEY ("semiProductId") REFERENCES "SemiProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierPurchaseOrder" ADD CONSTRAINT "SupplierPurchaseOrder_finishedProductId_fkey" FOREIGN KEY ("finishedProductId") REFERENCES "FinishedProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierPurchaseOrder" ADD CONSTRAINT "SupplierPurchaseOrder_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierPurchaseOrder" ADD CONSTRAINT "SupplierPurchaseOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
