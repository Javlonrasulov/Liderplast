-- Smena yozuvida kraska/bo'yoq sarfini saqlash va xomashyo bilan bog'lash
ALTER TABLE "ShiftRecord" ADD COLUMN "paintUsed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ShiftRecord" ADD COLUMN "paintRawMaterialId" TEXT;
ALTER TABLE "ShiftRecord" ADD COLUMN "paintQuantityKg" DOUBLE PRECISION;

ALTER TABLE "ShiftRecord" ADD CONSTRAINT "ShiftRecord_paintRawMaterialId_fkey" FOREIGN KEY ("paintRawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE SET NULL ON UPDATE CASCADE;
