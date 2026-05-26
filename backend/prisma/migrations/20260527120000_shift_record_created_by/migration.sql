-- Smena yozuvini kim kiritgani (tizim foydalanuvchisi)
ALTER TABLE "ShiftRecord" ADD COLUMN "createdById" TEXT;

ALTER TABLE "ShiftRecord" ADD CONSTRAINT "ShiftRecord_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "ShiftRecord_createdById_idx" ON "ShiftRecord"("createdById");
