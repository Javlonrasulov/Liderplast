-- CreateEnum
CREATE TYPE "BagStatus" AS ENUM ('IN_STORAGE', 'CONNECTED', 'DEPLETED', 'WRITTEN_OFF');

-- CreateEnum
CREATE TYPE "BagAuditActionType" AS ENUM ('CREATED', 'CONNECTED', 'DISCONNECTED', 'RETURNED_TO_STORAGE', 'CONSUMED', 'DEPLETED', 'WRITTEN_OFF');

-- CreateTable
CREATE TABLE "RawMaterialBag" (
    "id" TEXT NOT NULL,
    "rawMaterialId" TEXT NOT NULL,
    "name" TEXT,
    "initialQuantityKg" DOUBLE PRECISION NOT NULL,
    "currentQuantityKg" DOUBLE PRECISION NOT NULL,
    "status" "BagStatus" NOT NULL DEFAULT 'IN_STORAGE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RawMaterialBag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BagConnectionSession" (
    "id" TEXT NOT NULL,
    "bagId" TEXT NOT NULL,
    "machineId" TEXT,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disconnectedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BagConnectionSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BagWriteoff" (
    "id" TEXT NOT NULL,
    "bagId" TEXT NOT NULL,
    "initialQuantityKg" DOUBLE PRECISION NOT NULL,
    "remainingQuantityKg" DOUBLE PRECISION NOT NULL,
    "connectedAt" TIMESTAMP(3),
    "disconnectedAt" TIMESTAMP(3),
    "reason" TEXT,
    "writtenOffAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,

    CONSTRAINT "BagWriteoff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BagAuditLog" (
    "id" TEXT NOT NULL,
    "bagId" TEXT NOT NULL,
    "rawMaterialId" TEXT NOT NULL,
    "actionType" "BagAuditActionType" NOT NULL,
    "quantityKg" DOUBLE PRECISION,
    "note" TEXT,
    "metadata" JSONB,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BagAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RawMaterialBag_rawMaterialId_status_idx" ON "RawMaterialBag"("rawMaterialId", "status");

-- CreateIndex
CREATE INDEX "RawMaterialBag_createdAt_idx" ON "RawMaterialBag"("createdAt");

-- CreateIndex
CREATE INDEX "BagConnectionSession_bagId_isActive_idx" ON "BagConnectionSession"("bagId", "isActive");

-- CreateIndex
CREATE INDEX "BagConnectionSession_machineId_idx" ON "BagConnectionSession"("machineId");

-- CreateIndex
CREATE INDEX "BagWriteoff_bagId_idx" ON "BagWriteoff"("bagId");

-- CreateIndex
CREATE INDEX "BagWriteoff_writtenOffAt_idx" ON "BagWriteoff"("writtenOffAt");

-- CreateIndex
CREATE INDEX "BagAuditLog_bagId_createdAt_idx" ON "BagAuditLog"("bagId", "createdAt");

-- CreateIndex
CREATE INDEX "BagAuditLog_rawMaterialId_createdAt_idx" ON "BagAuditLog"("rawMaterialId", "createdAt");

-- CreateIndex
CREATE INDEX "BagAuditLog_referenceType_referenceId_idx" ON "BagAuditLog"("referenceType", "referenceId");

-- AddForeignKey
ALTER TABLE "RawMaterialBag" ADD CONSTRAINT "RawMaterialBag_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BagConnectionSession" ADD CONSTRAINT "BagConnectionSession_bagId_fkey" FOREIGN KEY ("bagId") REFERENCES "RawMaterialBag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BagConnectionSession" ADD CONSTRAINT "BagConnectionSession_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BagWriteoff" ADD CONSTRAINT "BagWriteoff_bagId_fkey" FOREIGN KEY ("bagId") REFERENCES "RawMaterialBag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BagWriteoff" ADD CONSTRAINT "BagWriteoff_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BagAuditLog" ADD CONSTRAINT "BagAuditLog_bagId_fkey" FOREIGN KEY ("bagId") REFERENCES "RawMaterialBag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BagAuditLog" ADD CONSTRAINT "BagAuditLog_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BagAuditLog" ADD CONSTRAINT "BagAuditLog_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
