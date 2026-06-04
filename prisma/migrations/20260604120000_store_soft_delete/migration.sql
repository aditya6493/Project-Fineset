-- Soft delete: stores hidden from UI; recoverable until purgeAt (90-day grace).
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "purgeAt" TIMESTAMP(3);
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "deletedByEmail" TEXT;

CREATE INDEX IF NOT EXISTS "Store_deletedAt_idx" ON "Store"("deletedAt");
CREATE INDEX IF NOT EXISTS "Store_purgeAt_idx" ON "Store"("purgeAt");
