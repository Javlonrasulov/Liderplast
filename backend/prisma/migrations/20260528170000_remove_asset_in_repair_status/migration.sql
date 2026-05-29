UPDATE "CompanyAsset" SET status = 'ACTIVE' WHERE status = 'IN_REPAIR';

ALTER TYPE "CompanyAssetStatus" RENAME TO "CompanyAssetStatus_old";
CREATE TYPE "CompanyAssetStatus" AS ENUM ('ACTIVE', 'WRITTEN_OFF');
ALTER TABLE "CompanyAsset" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "CompanyAsset" ALTER COLUMN "status" TYPE "CompanyAssetStatus" USING ("status"::text::"CompanyAssetStatus");
ALTER TABLE "CompanyAsset" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
DROP TYPE "CompanyAssetStatus_old";
