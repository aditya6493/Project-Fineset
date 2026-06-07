-- CreateEnum
CREATE TYPE "CallValueTier" AS ENUM ('HIGH', 'MID', 'LOW');

-- AlterTable
ALTER TABLE "Visit" ADD COLUMN "callValueTier" "CallValueTier",
ADD COLUMN "birthMonth" INTEGER,
ADD COLUMN "anniversaryMonth" INTEGER;

-- AlterTable
ALTER TABLE "FieldSale" ADD COLUMN "callValueTier" "CallValueTier",
ADD COLUMN "birthMonth" INTEGER,
ADD COLUMN "anniversaryMonth" INTEGER;

-- Backfill Visit callValueTier
UPDATE "Visit" SET "callValueTier" = CASE
  WHEN "transactionAmount" >= 50000 THEN 'HIGH'::"CallValueTier"
  WHEN "transactionAmount" >= 15000 THEN 'MID'::"CallValueTier"
  WHEN "transactionAmount" IS NOT NULL THEN 'LOW'::"CallValueTier"
  WHEN "budgetStated" IN ('ABOVE_1L', 'K50_1L') THEN 'HIGH'::"CallValueTier"
  WHEN "budgetStated" = 'K15_50K' THEN 'MID'::"CallValueTier"
  WHEN "budgetStated" = 'UNDER_15K' THEN 'LOW'::"CallValueTier"
  WHEN "purchaseStatus" = 'PURCHASED' THEN 'MID'::"CallValueTier"
  ELSE 'LOW'::"CallValueTier"
END;

-- Backfill Visit birthMonth / anniversaryMonth from visit or customer dates
UPDATE "Visit" v SET
  "birthMonth" = EXTRACT(MONTH FROM (COALESCE(v."dateOfBirth", c."dateOfBirth") AT TIME ZONE 'UTC'))::int,
  "anniversaryMonth" = EXTRACT(MONTH FROM (COALESCE(v."anniversary", c."anniversary") AT TIME ZONE 'UTC'))::int
FROM "Customer" c
WHERE v."customerId" = c.id
  AND (v."dateOfBirth" IS NOT NULL OR c."dateOfBirth" IS NOT NULL OR v."anniversary" IS NOT NULL OR c."anniversary" IS NOT NULL);

UPDATE "Visit" SET
  "birthMonth" = EXTRACT(MONTH FROM ("dateOfBirth" AT TIME ZONE 'UTC'))::int
WHERE "birthMonth" IS NULL AND "dateOfBirth" IS NOT NULL;

UPDATE "Visit" SET
  "anniversaryMonth" = EXTRACT(MONTH FROM ("anniversary" AT TIME ZONE 'UTC'))::int
WHERE "anniversaryMonth" IS NULL AND "anniversary" IS NOT NULL;

-- Backfill FieldSale callValueTier
UPDATE "FieldSale" SET "callValueTier" = CASE
  WHEN "monthlyCommitment" >= 50000 THEN 'HIGH'::"CallValueTier"
  WHEN "monthlyCommitment" >= 15000 THEN 'MID'::"CallValueTier"
  WHEN "monthlyCommitment" IS NOT NULL THEN 'LOW'::"CallValueTier"
  ELSE 'LOW'::"CallValueTier"
END;

-- Backfill FieldSale birthMonth / anniversaryMonth from customer
UPDATE "FieldSale" fs SET
  "birthMonth" = EXTRACT(MONTH FROM (c."dateOfBirth" AT TIME ZONE 'UTC'))::int,
  "anniversaryMonth" = EXTRACT(MONTH FROM (c."anniversary" AT TIME ZONE 'UTC'))::int
FROM "Customer" c
WHERE fs."customerId" = c.id
  AND (c."dateOfBirth" IS NOT NULL OR c."anniversary" IS NOT NULL);

-- CreateIndex
CREATE INDEX "Visit_staffId_storeId_visitDate_callValueTier_birthMonth_anniversaryMonth_idx" ON "Visit"("staffId", "storeId", "visitDate" DESC, "callValueTier", "birthMonth", "anniversaryMonth");

-- CreateIndex
CREATE INDEX "FieldSale_staffId_storeId_activityDate_callValueTier_birthMonth_anniversaryMonth_idx" ON "FieldSale"("staffId", "storeId", "activityDate" DESC, "callValueTier", "birthMonth", "anniversaryMonth");
