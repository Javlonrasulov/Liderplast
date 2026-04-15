-- Sync DB with Prisma schema (isDeleted, product relations, ProductAuditLog).
-- Fixes P2022 "column does not exist" / HTTP 500 when loading SemiProduct/FinishedProduct joins.

-- CreateEnum
CREATE TYPE "ProductAuditActionType" AS ENUM ('CREATED', 'UPDATED', 'DELETED');

-- CreateEnum
CREATE TYPE "ProductAuditEntityType" AS ENUM ('RAW_MATERIAL', 'SEMI_PRODUCT', 'FINISHED_PRODUCT');

-- AlterTable
ALTER TABLE "FinishedProduct" ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "RawMaterial" ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SemiProduct" ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "SemiProductRawMaterial" (
    "id" TEXT NOT NULL,
    "semiProductId" TEXT NOT NULL,
    "rawMaterialId" TEXT NOT NULL,
    "amountGram" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SemiProductRawMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinishedProductSemiProduct" (
    "id" TEXT NOT NULL,
    "finishedProductId" TEXT NOT NULL,
    "semiProductId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinishedProductSemiProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinishedProductMachine" (
    "id" TEXT NOT NULL,
    "finishedProductId" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinishedProductMachine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAuditLog" (
    "id" TEXT NOT NULL,
    "entityType" "ProductAuditEntityType" NOT NULL,
    "actionType" "ProductAuditActionType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "actorId" TEXT,
    "rawMaterialId" TEXT,
    "semiProductId" TEXT,
    "finishedProductId" TEXT,
    "previousData" JSONB,
    "nextData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SemiProductRawMaterial_rawMaterialId_idx" ON "SemiProductRawMaterial"("rawMaterialId");

-- CreateIndex
CREATE UNIQUE INDEX "SemiProductRawMaterial_semiProductId_rawMaterialId_key" ON "SemiProductRawMaterial"("semiProductId", "rawMaterialId");

-- CreateIndex
CREATE INDEX "FinishedProductSemiProduct_semiProductId_idx" ON "FinishedProductSemiProduct"("semiProductId");

-- CreateIndex
CREATE UNIQUE INDEX "FinishedProductSemiProduct_finishedProductId_semiProductId_key" ON "FinishedProductSemiProduct"("finishedProductId", "semiProductId");

-- CreateIndex
CREATE INDEX "FinishedProductMachine_machineId_idx" ON "FinishedProductMachine"("machineId");

-- CreateIndex
CREATE UNIQUE INDEX "FinishedProductMachine_finishedProductId_machineId_key" ON "FinishedProductMachine"("finishedProductId", "machineId");

-- CreateIndex
CREATE INDEX "ProductAuditLog_entityType_entityId_createdAt_idx" ON "ProductAuditLog"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "ProductAuditLog_actorId_createdAt_idx" ON "ProductAuditLog"("actorId", "createdAt");

-- AddForeignKey
ALTER TABLE "SemiProductRawMaterial" ADD CONSTRAINT "SemiProductRawMaterial_semiProductId_fkey" FOREIGN KEY ("semiProductId") REFERENCES "SemiProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemiProductRawMaterial" ADD CONSTRAINT "SemiProductRawMaterial_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinishedProductSemiProduct" ADD CONSTRAINT "FinishedProductSemiProduct_finishedProductId_fkey" FOREIGN KEY ("finishedProductId") REFERENCES "FinishedProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinishedProductSemiProduct" ADD CONSTRAINT "FinishedProductSemiProduct_semiProductId_fkey" FOREIGN KEY ("semiProductId") REFERENCES "SemiProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinishedProductMachine" ADD CONSTRAINT "FinishedProductMachine_finishedProductId_fkey" FOREIGN KEY ("finishedProductId") REFERENCES "FinishedProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinishedProductMachine" ADD CONSTRAINT "FinishedProductMachine_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAuditLog" ADD CONSTRAINT "ProductAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAuditLog" ADD CONSTRAINT "ProductAuditLog_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAuditLog" ADD CONSTRAINT "ProductAuditLog_semiProductId_fkey" FOREIGN KEY ("semiProductId") REFERENCES "SemiProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAuditLog" ADD CONSTRAINT "ProductAuditLog_finishedProductId_fkey" FOREIGN KEY ("finishedProductId") REFERENCES "FinishedProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;
