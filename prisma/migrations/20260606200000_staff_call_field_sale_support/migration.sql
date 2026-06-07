-- Allow staff call logs and phone reveals for field sales as well as store visits
ALTER TABLE "StaffCallLog" ALTER COLUMN "visitId" DROP NOT NULL;
ALTER TABLE "StaffCallLog" ADD COLUMN IF NOT EXISTS "fieldSaleId" TEXT;

ALTER TABLE "PhoneRevealLog" ALTER COLUMN "visitId" DROP NOT NULL;
ALTER TABLE "PhoneRevealLog" ADD COLUMN IF NOT EXISTS "fieldSaleId" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'StaffCallLog_fieldSaleId_fkey'
  ) THEN
    ALTER TABLE "StaffCallLog"
      ADD CONSTRAINT "StaffCallLog_fieldSaleId_fkey"
      FOREIGN KEY ("fieldSaleId") REFERENCES "FieldSale"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PhoneRevealLog_fieldSaleId_fkey'
  ) THEN
    ALTER TABLE "PhoneRevealLog"
      ADD CONSTRAINT "PhoneRevealLog_fieldSaleId_fkey"
      FOREIGN KEY ("fieldSaleId") REFERENCES "FieldSale"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "StaffCallLog_fieldSaleId_staffId_createdAt_idx"
  ON "StaffCallLog"("fieldSaleId", "staffId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "PhoneRevealLog_fieldSaleId_staffId_createdAt_idx"
  ON "PhoneRevealLog"("fieldSaleId", "staffId", "createdAt" DESC);
