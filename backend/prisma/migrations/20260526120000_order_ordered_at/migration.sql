-- Sotuv sanasi (orderedAt); mavjud yozuvlar uchun createdAt dan to'ldiriladi
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "Order" SET "orderedAt" = "createdAt" WHERE "orderedAt" IS NULL OR "orderedAt" = "createdAt";

CREATE INDEX IF NOT EXISTS "Order_orderedAt_idx" ON "Order"("orderedAt");
