ALTER TABLE "Store"
ADD COLUMN "customCategory" TEXT;

CREATE TABLE "StoreCategoryOption" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StoreCategoryOption_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StoreCategoryOption_name_key" ON "StoreCategoryOption"("name");
