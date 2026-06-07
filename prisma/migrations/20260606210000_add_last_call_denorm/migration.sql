-- AlterTable
ALTER TABLE "Visit" ADD COLUMN "lastCallAnswered" "CallAnswerStatus",
ADD COLUMN "lastCallAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "FieldSale" ADD COLUMN "lastCallAnswered" "CallAnswerStatus",
ADD COLUMN "lastCallAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Visit_staffId_storeId_visitDate_lastCallAnswered_idx" ON "Visit"("staffId", "storeId", "visitDate" DESC, "lastCallAnswered");

-- CreateIndex
CREATE INDEX "FieldSale_staffId_storeId_activityDate_lastCallAnswered_idx" ON "FieldSale"("staffId", "storeId", "activityDate" DESC, "lastCallAnswered");

-- Backfill Visit last call from StaffCallLog
UPDATE "Visit" v
SET
  "lastCallAnswered" = latest.answered,
  "lastCallAt" = latest."createdAt"
FROM (
  SELECT DISTINCT ON ("visitId", "staffId")
    "visitId",
    "staffId",
    answered,
    "createdAt"
  FROM "StaffCallLog"
  WHERE "visitId" IS NOT NULL
  ORDER BY "visitId", "staffId", "createdAt" DESC
) latest
WHERE v.id = latest."visitId" AND v."staffId" = latest."staffId";

-- Backfill FieldSale last call from StaffCallLog
UPDATE "FieldSale" f
SET
  "lastCallAnswered" = latest.answered,
  "lastCallAt" = latest."createdAt"
FROM (
  SELECT DISTINCT ON ("fieldSaleId", "staffId")
    "fieldSaleId",
    "staffId",
    answered,
    "createdAt"
  FROM "StaffCallLog"
  WHERE "fieldSaleId" IS NOT NULL
  ORDER BY "fieldSaleId", "staffId", "createdAt" DESC
) latest
WHERE f.id = latest."fieldSaleId" AND f."staffId" = latest."staffId";
