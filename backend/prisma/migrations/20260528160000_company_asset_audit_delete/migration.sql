-- AlterEnum
ALTER TYPE "CompanyAssetActionType" ADD VALUE IF NOT EXISTS 'DELETED';

-- AlterTable
ALTER TABLE "CompanyAsset" ADD COLUMN IF NOT EXISTS "updatedById" TEXT;
ALTER TABLE "CompanyAsset" ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "CompanyAsset" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "CompanyAsset" ADD COLUMN IF NOT EXISTS "deletedById" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CompanyAsset_isDeleted_idx" ON "CompanyAsset"("isDeleted");

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CompanyAsset_updatedById_fkey'
  ) THEN
    ALTER TABLE "CompanyAsset" ADD CONSTRAINT "CompanyAsset_updatedById_fkey"
      FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CompanyAsset_deletedById_fkey'
  ) THEN
    ALTER TABLE "CompanyAsset" ADD CONSTRAINT "CompanyAsset_deletedById_fkey"
      FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
