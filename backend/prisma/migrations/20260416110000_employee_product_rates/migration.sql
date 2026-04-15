-- CreateEnum
CREATE TYPE "EmployeeRateType" AS ENUM ('FIXED', 'PERCENT');

-- CreateTable
CREATE TABLE "EmployeeProductRate" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "productLabel" TEXT NOT NULL,
    "rateType" "EmployeeRateType" NOT NULL DEFAULT 'FIXED',
    "rateValue" DOUBLE PRECISION NOT NULL,
    "baseAmount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeProductRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeProductRate_workerId_productLabel_key" ON "EmployeeProductRate"("workerId", "productLabel");

-- CreateIndex
CREATE INDEX "EmployeeProductRate_workerId_idx" ON "EmployeeProductRate"("workerId");

-- AddForeignKey
ALTER TABLE "EmployeeProductRate" ADD CONSTRAINT "EmployeeProductRate_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
