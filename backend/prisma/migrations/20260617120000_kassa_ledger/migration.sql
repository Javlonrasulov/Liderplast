-- CreateEnum
CREATE TYPE "KassaEntryType" AS ENUM ('CLIENT_INFLOW', 'SALE_DEDUCTION', 'OUTFLOW');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN "cashBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "KassaEntry" (
    "id" TEXT NOT NULL,
    "type" "KassaEntryType" NOT NULL,
    "clientId" TEXT,
    "orderId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KassaEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KassaEntry_type_entryDate_idx" ON "KassaEntry"("type", "entryDate");

-- CreateIndex
CREATE INDEX "KassaEntry_clientId_idx" ON "KassaEntry"("clientId");

-- CreateIndex
CREATE INDEX "KassaEntry_orderId_idx" ON "KassaEntry"("orderId");

-- AddForeignKey
ALTER TABLE "KassaEntry" ADD CONSTRAINT "KassaEntry_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KassaEntry" ADD CONSTRAINT "KassaEntry_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KassaEntry" ADD CONSTRAINT "KassaEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KassaEntry" ADD CONSTRAINT "KassaEntry_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
