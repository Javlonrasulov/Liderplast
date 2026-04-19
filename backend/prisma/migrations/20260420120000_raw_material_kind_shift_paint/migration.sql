-- CreateEnum
CREATE TYPE "RawMaterialKind" AS ENUM ('SIRO', 'PAINT');

-- AlterTable
ALTER TABLE "RawMaterial" ADD COLUMN "kind" "RawMaterialKind" NOT NULL DEFAULT 'SIRO';

-- AlterTable
ALTER TABLE "ShiftRecord" ADD COLUMN "paintUsed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ShiftRecord" ADD COLUMN "paintRawMaterialId" TEXT;
ALTER TABLE "ShiftRecord" ADD COLUMN "paintQuantityKg" DOUBLE PRECISION;

-- AddForeignKey
ALTER TABLE "ShiftRecord" ADD CONSTRAINT "ShiftRecord_paintRawMaterialId_fkey" FOREIGN KEY ("paintRawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE SET NULL ON UPDATE CASCADE;
