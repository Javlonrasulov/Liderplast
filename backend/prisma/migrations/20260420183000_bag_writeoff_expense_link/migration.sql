-- AlterTable
ALTER TABLE "BagWriteoff" ADD COLUMN "expenseId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "BagWriteoff_expenseId_key" ON "BagWriteoff"("expenseId");

-- AddForeignKey
ALTER TABLE "BagWriteoff" ADD CONSTRAINT "BagWriteoff_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;
