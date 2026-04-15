-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stir" TEXT;

-- CreateEnum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BankVedomostStatus') THEN
    CREATE TYPE "BankVedomostStatus" AS ENUM ('DRAFT', 'PARSED', 'CONFIRMED', 'REJECTED');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BankTransactionType') THEN
    CREATE TYPE "BankTransactionType" AS ENUM ('INCOME', 'EXPENSE');
  END IF;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "BankVedomost" (
  "id" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "totalIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalExpense" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" "BankVedomostStatus" NOT NULL DEFAULT 'DRAFT',
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "BankVedomost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BankTransaction" (
  "id" TEXT NOT NULL,
  "bankVedomostId" TEXT NOT NULL,
  "type" "BankTransactionType" NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "documentDate" TIMESTAMP(3),
  "documentNumber" TEXT,
  "operationDate" TIMESTAMP(3) NOT NULL,
  "receiverName" TEXT,
  "receiverAccount" TEXT,
  "receiverBankName" TEXT,
  "receiverStir" TEXT,
  "paymentPurpose" TEXT,
  "isSalary" BOOLEAN NOT NULL DEFAULT false,
  "employeeId" TEXT,
  "clientId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "BankTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_stir_idx" ON "User"("stir");
CREATE INDEX IF NOT EXISTS "BankTransaction_bankVedomostId_operationDate_idx" ON "BankTransaction"("bankVedomostId", "operationDate");
CREATE INDEX IF NOT EXISTS "BankTransaction_employeeId_isSalary_idx" ON "BankTransaction"("employeeId", "isSalary");
CREATE INDEX IF NOT EXISTS "BankTransaction_clientId_idx" ON "BankTransaction"("clientId");
CREATE INDEX IF NOT EXISTS "BankTransaction_documentNumber_amount_idx" ON "BankTransaction"("documentNumber", "amount");
CREATE INDEX IF NOT EXISTS "BankTransaction_receiverStir_idx" ON "BankTransaction"("receiverStir");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'BankTransaction_bankVedomostId_fkey'
  ) THEN
    ALTER TABLE "BankTransaction"
      ADD CONSTRAINT "BankTransaction_bankVedomostId_fkey"
      FOREIGN KEY ("bankVedomostId") REFERENCES "BankVedomost"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'BankTransaction_clientId_fkey'
  ) THEN
    ALTER TABLE "BankTransaction"
      ADD CONSTRAINT "BankTransaction_clientId_fkey"
      FOREIGN KEY ("clientId") REFERENCES "Client"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'BankTransaction_employeeId_fkey'
  ) THEN
    ALTER TABLE "BankTransaction"
      ADD CONSTRAINT "BankTransaction_employeeId_fkey"
      FOREIGN KEY ("employeeId") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
