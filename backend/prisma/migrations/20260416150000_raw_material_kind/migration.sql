CREATE TYPE "RawMaterialKind" AS ENUM ('SIRO', 'PAINT');

ALTER TABLE "RawMaterial" ADD COLUMN "kind" "RawMaterialKind" NOT NULL DEFAULT 'SIRO';
