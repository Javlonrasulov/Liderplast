-- CreateEnum
CREATE TYPE "BankStatementSource" AS ENUM ('BANK', 'KASSA');

-- CreateEnum
CREATE TYPE "BankRowReviewStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "BankCounterpartyKind" AS ENUM ('UNKNOWN', 'CLIENT', 'SUPPLIER', 'COMPANY');

-- CreateEnum
CREATE TYPE "CompanyBankAccountAction" AS ENUM ('ADDED', 'REMOVED', 'ACTIVATED', 'UPDATED');

-- AlterEnum
ALTER TYPE "KassaEntryType" ADD VALUE 'BANK_INFLOW';

-- DropIndex
DROP INDEX "Expense_updatedById_idx";

-- DropIndex
DROP INDEX "ShiftRecord_createdById_idx";

-- AlterTable
ALTER TABLE "BankTransaction" ADD COLUMN     "companyAccount" TEXT,
ADD COLUMN     "companyBankName" TEXT,
ADD COLUMN     "companyStir" TEXT,
ADD COLUMN     "counterpartyKind" "BankCounterpartyKind" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "expenseId" TEXT,
ADD COLUMN     "kassaEntryId" TEXT,
ADD COLUMN     "receiverBankCode" TEXT,
ADD COLUMN     "reviewStatus" "BankRowReviewStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "supplierId" TEXT,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "BankVedomost" ADD COLUMN     "source" "BankStatementSource" NOT NULL DEFAULT 'BANK';

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "stir" TEXT;

-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "bankAccount" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "stir" TEXT;

-- CreateTable
CREATE TABLE "CompanyBankAccount" (
    "id" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "label" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyBankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyBankAccountLog" (
    "id" TEXT NOT NULL,
    "accountId" TEXT,
    "accountNumber" TEXT,
    "label" TEXT,
    "action" "CompanyBankAccountAction" NOT NULL,
    "performedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyBankAccountLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyBankAccount_accountNumber_key" ON "CompanyBankAccount"("accountNumber");

-- CreateIndex
CREATE INDEX "CompanyBankAccountLog_accountId_idx" ON "CompanyBankAccountLog"("accountId");

-- CreateIndex
CREATE INDEX "CompanyBankAccountLog_performedById_idx" ON "CompanyBankAccountLog"("performedById");

-- CreateIndex
CREATE INDEX "CompanyBankAccountLog_createdAt_idx" ON "CompanyBankAccountLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BankTransaction_expenseId_key" ON "BankTransaction"("expenseId");

-- CreateIndex
CREATE UNIQUE INDEX "BankTransaction_kassaEntryId_key" ON "BankTransaction"("kassaEntryId");

-- CreateIndex
CREATE INDEX "BankTransaction_supplierId_idx" ON "BankTransaction"("supplierId");

-- CreateIndex
CREATE INDEX "BankTransaction_reviewStatus_idx" ON "BankTransaction"("reviewStatus");

-- AddForeignKey
ALTER TABLE "BankTransaction" ADD CONSTRAINT "BankTransaction_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankTransaction" ADD CONSTRAINT "BankTransaction_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankTransaction" ADD CONSTRAINT "BankTransaction_kassaEntryId_fkey" FOREIGN KEY ("kassaEntryId") REFERENCES "KassaEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankTransaction" ADD CONSTRAINT "BankTransaction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankTransaction" ADD CONSTRAINT "BankTransaction_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyBankAccount" ADD CONSTRAINT "CompanyBankAccount_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyBankAccount" ADD CONSTRAINT "CompanyBankAccount_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyBankAccountLog" ADD CONSTRAINT "CompanyBankAccountLog_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CompanyBankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyBankAccountLog" ADD CONSTRAINT "CompanyBankAccountLog_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
