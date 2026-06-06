-- Run in Supabase SQL Editor when Customer/Visit profile columns are missing.
-- Safe to run multiple times (IF NOT EXISTS).

ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP(3);
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "anniversary" TIMESTAMP(3);

ALTER TABLE "Visit" ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP(3);
ALTER TABLE "Visit" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "Visit" ADD COLUMN IF NOT EXISTS "profession" TEXT;
ALTER TABLE "Visit" ADD COLUMN IF NOT EXISTS "anniversary" TIMESTAMP(3);

SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('Customer', 'Visit')
  AND column_name IN (
    'dateOfBirth',
    'address',
    'profession',
    'anniversary'
  )
ORDER BY table_name, column_name;
