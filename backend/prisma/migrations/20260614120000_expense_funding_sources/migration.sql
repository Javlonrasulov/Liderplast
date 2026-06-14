-- CreateTable
CREATE TABLE "ExpenseFundingSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpenseFundingSource_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN "fundingSourceId" TEXT;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_fundingSourceId_fkey" FOREIGN KEY ("fundingSourceId") REFERENCES "ExpenseFundingSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed default funding sources
INSERT INTO "ExpenseFundingSource" ("id", "name", "createdAt") VALUES
  ('expfund_cash', 'Kassa (naqd)', CURRENT_TIMESTAMP),
  ('expfund_bank', 'Bank hisobi', CURRENT_TIMESTAMP);
