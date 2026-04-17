-- CreateTable
CREATE TABLE "ExpenseCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legacyExpenseType" "ExpenseType" NOT NULL DEFAULT 'OTHER',
    "electricityCalc" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpenseCategory_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN "categoryId" TEXT;

INSERT INTO "ExpenseCategory" ("id", "name", "legacyExpenseType", "electricityCalc", "deletedAt", "createdAt")
VALUES
  ('expseed_electricity', 'Elektr energiya', 'ELECTRICITY', true, NULL, CURRENT_TIMESTAMP),
  ('expseed_caps', 'Qopqoq', 'CAPS', false, NULL, CURRENT_TIMESTAMP),
  ('expseed_packaging', 'Paket', 'PACKAGING', false, NULL, CURRENT_TIMESTAMP),
  ('expseed_other', 'Boshqa', 'OTHER', false, NULL, CURRENT_TIMESTAMP);

UPDATE "Expense" SET "categoryId" = 'expseed_electricity' WHERE "type" = 'ELECTRICITY';
UPDATE "Expense" SET "categoryId" = 'expseed_caps' WHERE "type" = 'CAPS';
UPDATE "Expense" SET "categoryId" = 'expseed_packaging' WHERE "type" = 'PACKAGING';
UPDATE "Expense" SET "categoryId" = 'expseed_other' WHERE "type" = 'OTHER';
UPDATE "Expense" SET "categoryId" = 'expseed_other' WHERE "categoryId" IS NULL;

CREATE INDEX "Expense_categoryId_idx" ON "Expense"("categoryId");

ALTER TABLE "Expense" ADD CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
