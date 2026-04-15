-- CreateEnum: add ADMIN to Role (PostgreSQL)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'Role' AND e.enumlabel = 'ADMIN') THEN
    ALTER TYPE "Role" ADD VALUE 'ADMIN';
  END IF;
END $$;

-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "login" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "customRoleLabel" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "permissions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "canLogin" BOOLEAN NOT NULL DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS "User_login_key" ON "User"("login") WHERE "login" IS NOT NULL;

UPDATE "User" SET "canLogin" = false WHERE "role" = 'WORKER';
