-- Qadoqlash smenasi: tarixda alohida tur, qop/pachka, elektr sarfisiz
CREATE TYPE "ShiftRecordKind" AS ENUM ('PRODUCTION', 'PACKAGING');

ALTER TABLE "ShiftRecord"
  ADD COLUMN "recordKind" "ShiftRecordKind" NOT NULL DEFAULT 'PRODUCTION',
  ADD COLUMN "bagCount" INTEGER,
  ADD COLUMN "packCount" INTEGER;
