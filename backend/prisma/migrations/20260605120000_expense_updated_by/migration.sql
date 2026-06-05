-- Xarajat: kim kiritgan / kim oxirgi o'zgartirgan
ALTER TABLE "Expense" ADD COLUMN "updatedAt" TIMESTAMP(3);
UPDATE "Expense" SET "updatedAt" = "createdAt";
ALTER TABLE "Expense" ALTER COLUMN "updatedAt" SET NOT NULL;
ALTER TABLE "Expense" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Expense" ADD COLUMN "updatedById" TEXT;

ALTER TABLE "Expense" ADD CONSTRAINT "Expense_updatedById_fkey"
  FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Expense_updatedById_idx" ON "Expense"("updatedById");
