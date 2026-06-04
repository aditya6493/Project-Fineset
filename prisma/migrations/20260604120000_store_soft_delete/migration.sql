-- Soft delete: stores hidden from UI; recoverable until purgeAt (90-day grace).
ALTER TABLE "Store" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Store" ADD COLUMN "purgeAt" TIMESTAMP(3);
ALTER TABLE "Store" ADD COLUMN "deletedByEmail" TEXT;

CREATE INDEX "Store_deletedAt_idx" ON "Store"("deletedAt");
CREATE INDEX "Store_purgeAt_idx" ON "Store"("purgeAt");
