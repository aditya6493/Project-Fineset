-- Run in Supabase: SQL Editor -> New query -> paste -> Run
-- Fixes Add Store "Database schema is out of date"

ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "pincode" TEXT;
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "businessOwnerName" TEXT;
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "businessOwnerEmail" TEXT;
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "customCategory" TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Store' AND column_name = 'email'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Store' AND column_name = 'businessOwnerEmail'
  ) THEN
    ALTER TABLE "Store" RENAME COLUMN "email" TO "businessOwnerEmail";
  END IF;
END $$;

ALTER TABLE "Store" DROP COLUMN IF EXISTS "email";
ALTER TABLE "Store" DROP COLUMN IF EXISTS "pocName";
ALTER TABLE "Store" DROP COLUMN IF EXISTS "pointOfContactPhone";
ALTER TABLE "Store" DROP COLUMN IF EXISTS "pointOfContactRole";

CREATE TABLE IF NOT EXISTS "StoreCategoryOption" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StoreCategoryOption_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "StoreCategoryOption_name_key" ON "StoreCategoryOption"("name");

ALTER TYPE "SourceChannel" ADD VALUE IF NOT EXISTS 'USER_CALLS';

-- Verification (should list pincode, businessOwnerName, businessOwnerEmail, customCategory)
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'Store'
ORDER BY column_name;

SELECT COUNT(*) AS store_count FROM "Store";

SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'StoreCategoryOption'
) AS store_category_option_table_exists;
