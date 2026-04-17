-- CreateTable
CREATE TABLE "SemiProductMachine" (
    "id" TEXT NOT NULL,
    "semiProductId" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SemiProductMachine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SemiProductMachine_semiProductId_machineId_key" ON "SemiProductMachine"("semiProductId", "machineId");

-- CreateIndex
CREATE INDEX "SemiProductMachine_machineId_idx" ON "SemiProductMachine"("machineId");

-- AddForeignKey
ALTER TABLE "SemiProductMachine" ADD CONSTRAINT "SemiProductMachine_semiProductId_fkey" FOREIGN KEY ("semiProductId") REFERENCES "SemiProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SemiProductMachine" ADD CONSTRAINT "SemiProductMachine_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
