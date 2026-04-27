-- CreateTable
CREATE TABLE "ShiftMaterialUsage" (
    "id" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "rawMaterialId" TEXT NOT NULL,
    "expectedKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actualKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deltaKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShiftMaterialUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShiftMaterialUsage_rawMaterialId_idx" ON "ShiftMaterialUsage"("rawMaterialId");

-- CreateIndex
CREATE UNIQUE INDEX "ShiftMaterialUsage_shiftId_rawMaterialId_key" ON "ShiftMaterialUsage"("shiftId", "rawMaterialId");

-- AddForeignKey
ALTER TABLE "ShiftMaterialUsage" ADD CONSTRAINT "ShiftMaterialUsage_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "ShiftRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftMaterialUsage" ADD CONSTRAINT "ShiftMaterialUsage_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

