-- CreateEnum
CREATE TYPE "InventoryDocumentStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "InventoryDocument" (
    "id" TEXT NOT NULL,
    "docNumber" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL DEFAULT 'main',
    "warehouseName" TEXT NOT NULL,
    "dateFrom" TEXT NOT NULL,
    "dateTo" TEXT NOT NULL,
    "status" "InventoryDocumentStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "expenseIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rows" JSONB NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "InventoryDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InventoryDocument_docNumber_key" ON "InventoryDocument"("docNumber");

-- CreateIndex
CREATE INDEX "InventoryDocument_status_idx" ON "InventoryDocument"("status");

-- CreateIndex
CREATE INDEX "InventoryDocument_dateFrom_dateTo_idx" ON "InventoryDocument"("dateFrom", "dateTo");

-- CreateIndex
CREATE INDEX "InventoryDocument_warehouseId_idx" ON "InventoryDocument"("warehouseId");

-- CreateIndex
CREATE INDEX "InventoryDocument_docNumber_idx" ON "InventoryDocument"("docNumber");

-- AddForeignKey
ALTER TABLE "InventoryDocument" ADD CONSTRAINT "InventoryDocument_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
