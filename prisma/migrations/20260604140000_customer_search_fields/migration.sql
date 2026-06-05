-- Searchable derivatives for encrypted customer PII (name/phone remain encrypted).
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "nameSearch" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "phoneLast4" TEXT;

ALTER TABLE "Visit" ADD COLUMN IF NOT EXISTS "customerNameSearch" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Visit" ADD COLUMN IF NOT EXISTS "phoneLast4" TEXT;

ALTER TABLE "FieldSale" ADD COLUMN IF NOT EXISTS "customerNameSearch" TEXT NOT NULL DEFAULT '';
ALTER TABLE "FieldSale" ADD COLUMN IF NOT EXISTS "phoneLast4" TEXT;

CREATE INDEX IF NOT EXISTS "Customer_storeId_nameSearch_idx" ON "Customer"("storeId", "nameSearch");
CREATE INDEX IF NOT EXISTS "Customer_storeId_phoneLast4_idx" ON "Customer"("storeId", "phoneLast4");

CREATE INDEX IF NOT EXISTS "Visit_storeId_customerNameSearch_idx" ON "Visit"("storeId", "customerNameSearch");
CREATE INDEX IF NOT EXISTS "Visit_storeId_phoneLast4_idx" ON "Visit"("storeId", "phoneLast4");
