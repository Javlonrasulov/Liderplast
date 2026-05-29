-- Eski «Omborda» statusidagi mulklarni faol qilib qo‘yish
UPDATE "CompanyAsset" SET status = 'ACTIVE' WHERE status = 'IN_WAREHOUSE';

-- Enum qiymatini olib tashlash (PostgreSQL)
ALTER TYPE "CompanyAssetStatus" RENAME TO "CompanyAssetStatus_old";
CREATE TYPE "CompanyAssetStatus" AS ENUM ('ACTIVE', 'IN_REPAIR', 'WRITTEN_OFF');
ALTER TABLE "CompanyAsset" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "CompanyAsset" ALTER COLUMN "status" TYPE "CompanyAssetStatus" USING ("status"::text::"CompanyAssetStatus");
ALTER TABLE "CompanyAsset" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
DROP TYPE "CompanyAssetStatus_old";
