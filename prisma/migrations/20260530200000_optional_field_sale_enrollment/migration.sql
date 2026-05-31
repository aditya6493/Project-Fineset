-- Make scheme pitch fields optional on field sales
ALTER TABLE "FieldSale" ALTER COLUMN "enrollmentOutcome" DROP NOT NULL;
ALTER TABLE "FieldSale" ALTER COLUMN "schemesPitched" SET DEFAULT ARRAY[]::"SchemeProduct"[];
