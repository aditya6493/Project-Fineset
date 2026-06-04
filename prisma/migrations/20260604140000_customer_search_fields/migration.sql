-- Searchable derivatives for encrypted customer PII (name/phone remain encrypted).
ALTER TABLE "Customer" ADD COLUMN "nameSearch" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Customer" ADD COLUMN "phoneLast4" TEXT;

ALTER TABLE "Visit" ADD COLUMN "customerNameSearch" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Visit" ADD COLUMN "phoneLast4" TEXT;

ALTER TABLE "FieldSale" ADD COLUMN "customerNameSearch" TEXT NOT NULL DEFAULT '';
ALTER TABLE "FieldSale" ADD COLUMN "phoneLast4" TEXT;

CREATE INDEX "Customer_storeId_nameSearch_idx" ON "Customer"("storeId", "nameSearch");
CREATE INDEX "Customer_storeId_phoneLast4_idx" ON "Customer"("storeId", "phoneLast4");

CREATE INDEX "Visit_storeId_customerNameSearch_idx" ON "Visit"("storeId", "customerNameSearch");
CREATE INDEX "Visit_storeId_phoneLast4_idx" ON "Visit"("storeId", "phoneLast4");
