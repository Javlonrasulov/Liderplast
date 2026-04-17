ALTER TABLE "SalarySetting" ADD COLUMN "electricityPricePerKwh" DOUBLE PRECISION NOT NULL DEFAULT 800;

ALTER TABLE "Expense" ADD COLUMN "sourceShiftId" TEXT;

CREATE UNIQUE INDEX "Expense_sourceShiftId_key" ON "Expense"("sourceShiftId");

ALTER TABLE "Expense" ADD CONSTRAINT "Expense_sourceShiftId_fkey" FOREIGN KEY ("sourceShiftId") REFERENCES "ShiftRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
