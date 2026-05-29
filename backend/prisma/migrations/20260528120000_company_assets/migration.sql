-- CreateEnum
CREATE TYPE "CompanyAssetStatus" AS ENUM ('ACTIVE', 'IN_REPAIR', 'IN_WAREHOUSE', 'WRITTEN_OFF');

-- CreateEnum
CREATE TYPE "CompanyAssetCategory" AS ENUM ('TRANSPORT', 'OFFICE_EQUIPMENT', 'COMPUTER_TECH', 'PRODUCTION_EQUIPMENT', 'TECH_APPARATUS', 'FURNITURE', 'OTHER');

-- CreateEnum
CREATE TYPE "CompanyAssetCondition" AS ENUM ('NEW', 'GOOD', 'FAIR', 'POOR');

-- CreateEnum
CREATE TYPE "CompanyAssetActionType" AS ENUM ('CREATED', 'UPDATED', 'ASSIGNED', 'RETURNED', 'SENT_TO_REPAIR', 'WRITTEN_OFF');

-- CreateTable
CREATE TABLE "CompanyAsset" (
    "id" TEXT NOT NULL,
    "inventoryNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serialNumber" TEXT,
    "category" "CompanyAssetCategory" NOT NULL,
    "manufacturer" TEXT,
    "model" TEXT,
    "purchasedAt" TIMESTAMP(3) NOT NULL,
    "purchasePriceOriginal" DOUBLE PRECISION NOT NULL,
    "currency" "PurchaseOrderCurrency" NOT NULL,
    "fxRateToUzs" DOUBLE PRECISION NOT NULL,
    "initialValueUzs" DOUBLE PRECISION NOT NULL,
    "warrantyUntil" TIMESTAMP(3),
    "assignedUserId" TEXT,
    "location" TEXT,
    "condition" "CompanyAssetCondition" NOT NULL DEFAULT 'GOOD',
    "status" "CompanyAssetStatus" NOT NULL DEFAULT 'ACTIVE',
    "imageUrl" TEXT,
    "notes" TEXT,
    "expenseId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyAssetActivityLog" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "actionType" "CompanyAssetActionType" NOT NULL,
    "details" TEXT,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "performedById" TEXT,

    CONSTRAINT "CompanyAssetActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyAssetDocument" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyAssetDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyAsset_inventoryNumber_key" ON "CompanyAsset"("inventoryNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyAsset_expenseId_key" ON "CompanyAsset"("expenseId");

-- CreateIndex
CREATE INDEX "CompanyAsset_status_idx" ON "CompanyAsset"("status");

-- CreateIndex
CREATE INDEX "CompanyAsset_category_idx" ON "CompanyAsset"("category");

-- CreateIndex
CREATE INDEX "CompanyAsset_assignedUserId_idx" ON "CompanyAsset"("assignedUserId");

-- CreateIndex
CREATE INDEX "CompanyAsset_location_idx" ON "CompanyAsset"("location");

-- CreateIndex
CREATE INDEX "CompanyAsset_name_idx" ON "CompanyAsset"("name");

-- CreateIndex
CREATE INDEX "CompanyAssetActivityLog_assetId_performedAt_idx" ON "CompanyAssetActivityLog"("assetId", "performedAt");

-- CreateIndex
CREATE INDEX "CompanyAssetDocument_assetId_idx" ON "CompanyAssetDocument"("assetId");

-- AddForeignKey
ALTER TABLE "CompanyAsset" ADD CONSTRAINT "CompanyAsset_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyAsset" ADD CONSTRAINT "CompanyAsset_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyAsset" ADD CONSTRAINT "CompanyAsset_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyAssetActivityLog" ADD CONSTRAINT "CompanyAssetActivityLog_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "CompanyAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyAssetActivityLog" ADD CONSTRAINT "CompanyAssetActivityLog_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyAssetDocument" ADD CONSTRAINT "CompanyAssetDocument_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "CompanyAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
