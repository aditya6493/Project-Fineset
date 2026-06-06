-- AlterTable
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "businessOwnerName" TEXT;

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

ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "businessOwnerEmail" TEXT;
