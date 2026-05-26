-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "StoreCategory" AS ENUM ('JEWELRY', 'HANDBAGS', 'WATCHES', 'OTHER');

-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('STAFF', 'STORE_MANAGER', 'MASTER_ADMIN');

-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('NEW', 'REPEAT', 'VIP');

-- CreateEnum
CREATE TYPE "VisitType" AS ENUM ('WALK_IN', 'APPOINTMENT');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PURCHASED', 'NOT_PURCHASED', 'PENDING');

-- CreateEnum
CREATE TYPE "IntentTier" AS ENUM ('HOT', 'WARM', 'COLD', 'BROWSING');

-- CreateEnum
CREATE TYPE "BudgetRange" AS ENUM ('UNDER_15K', 'K15_50K', 'K50_1L', 'ABOVE_1L', 'NOT_STATED');

-- CreateEnum
CREATE TYPE "SourceChannel" AS ENUM ('ORGANIC_WALK_IN', 'REFERRAL', 'SOCIAL_MEDIA', 'INTERNET', 'PHONE', 'TANISHQ_REF', 'CARATLANE_REF', 'OTHER');

-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('OPEN', 'CLOSED', 'CONVERTED', 'NO_RESPONSE');

-- CreateEnum
CREATE TYPE "CallAnswerStatus" AS ENUM ('ANSWERED', 'NOT_ANSWERED');

-- CreateEnum
CREATE TYPE "FieldActivityType" AS ENUM ('DOOR_TO_DOOR', 'HOUSING_SOCIETY', 'CORPORATE', 'EVENT_EXHIBITION', 'MARKET_STALL', 'REFERRAL_MEET', 'OTHER');

-- CreateEnum
CREATE TYPE "SchemeProduct" AS ENUM ('GHS', 'GPP');

-- CreateEnum
CREATE TYPE "SchemeEnrollmentOutcome" AS ENUM ('ENROLLED_GHS', 'ENROLLED_GPP', 'ENROLLED_BOTH', 'INTERESTED', 'DECLINED', 'CALLBACK');

-- CreateEnum
CREATE TYPE "FieldDeclineReason" AS ENUM ('BUDGET', 'ALREADY_ENROLLED', 'NOT_INTERESTED', 'NEEDS_TIME', 'TRUST_CONCERNS', 'COMPETITOR_SCHEME');

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "StoreCategory" NOT NULL DEFAULT 'JEWELRY',
    "pincodeHash" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL DEFAULT 'STAFF',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phoneHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "area" TEXT,
    "profession" TEXT,
    "gender" TEXT,
    "ageGroup" TEXT,
    "activeScheme" TEXT,
    "ghsEnrolled" BOOLEAN NOT NULL DEFAULT false,
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inTime" TIMESTAMP(3),
    "outTime" TIMESTAMP(3),
    "durationMins" INTEGER,
    "storeId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerPhoneHash" TEXT NOT NULL,
    "customerType" "CustomerType" NOT NULL,
    "visitType" "VisitType" NOT NULL,
    "area" TEXT,
    "gender" TEXT,
    "ageGroup" TEXT,
    "purchaseStatus" "PurchaseStatus" NOT NULL,
    "productsPurchased" TEXT[],
    "productsExplored" TEXT[],
    "transactionAmount" DOUBLE PRECISION,
    "intentTier" "IntentTier",
    "reasonNoPurchase" TEXT,
    "competitorMention" TEXT,
    "purchaseOccasion" TEXT,
    "metalKtPref" TEXT,
    "budgetStated" "BudgetRange",
    "schemeEnrolled" BOOLEAN NOT NULL DEFAULT false,
    "ghsPolicy" BOOLEAN NOT NULL DEFAULT false,
    "schemesPitched" "SchemeProduct"[] DEFAULT ARRAY[]::"SchemeProduct"[],
    "enrollmentOutcome" "SchemeEnrollmentOutcome",
    "monthlyCommitment" DOUBLE PRECISION,
    "reasonNoEnrollment" "FieldDeclineReason",
    "schemeCompetitorMention" TEXT,
    "followUpNeeded" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" TIMESTAMP(3),
    "staffNotes" TEXT,
    "sourceChannel" "SourceChannel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUp" (
    "id" TEXT NOT NULL,
    "visitId" TEXT,
    "fieldSaleId" TEXT,
    "assignedStaffId" TEXT NOT NULL,
    "followUpDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "context" TEXT,
    "callOutcome" TEXT,
    "outcomeDate" TIMESTAMP(3),
    "status" "FollowUpStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffCallLog" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "answered" "CallAnswerStatus" NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffCallLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhoneRevealLog" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhoneRevealLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldSale" (
    "id" TEXT NOT NULL,
    "activityDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "durationMins" INTEGER,
    "storeId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerPhoneHash" TEXT,
    "customerType" "CustomerType" NOT NULL,
    "area" TEXT,
    "gender" TEXT,
    "ageGroup" TEXT,
    "profession" TEXT,
    "activityType" "FieldActivityType" NOT NULL,
    "locationLabel" TEXT,
    "schemesPitched" "SchemeProduct"[],
    "enrollmentOutcome" "SchemeEnrollmentOutcome" NOT NULL,
    "monthlyCommitment" DOUBLE PRECISION,
    "intentTier" "IntentTier",
    "reasonNoEnrollment" "FieldDeclineReason",
    "competitorMention" TEXT,
    "followUpNeeded" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" TIMESTAMP(3),
    "staffNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FieldSale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Staff_employeeId_key" ON "Staff"("employeeId");

-- CreateIndex
CREATE INDEX "Staff_storeId_isActive_idx" ON "Staff"("storeId", "isActive");

-- CreateIndex
CREATE INDEX "Customer_storeId_updatedAt_idx" ON "Customer"("storeId", "updatedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phoneHash_storeId_key" ON "Customer"("phoneHash", "storeId");

-- CreateIndex
CREATE INDEX "Visit_storeId_visitDate_idx" ON "Visit"("storeId", "visitDate" DESC);

-- CreateIndex
CREATE INDEX "Visit_staffId_storeId_visitDate_idx" ON "Visit"("staffId", "storeId", "visitDate" DESC);

-- CreateIndex
CREATE INDEX "Visit_storeId_customerPhoneHash_idx" ON "Visit"("storeId", "customerPhoneHash");

-- CreateIndex
CREATE UNIQUE INDEX "FollowUp_visitId_key" ON "FollowUp"("visitId");

-- CreateIndex
CREATE UNIQUE INDEX "FollowUp_fieldSaleId_key" ON "FollowUp"("fieldSaleId");

-- CreateIndex
CREATE INDEX "FollowUp_assignedStaffId_status_followUpDate_idx" ON "FollowUp"("assignedStaffId", "status", "followUpDate");

-- CreateIndex
CREATE INDEX "StaffCallLog_visitId_staffId_createdAt_idx" ON "StaffCallLog"("visitId", "staffId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "StaffCallLog_staffId_createdAt_idx" ON "StaffCallLog"("staffId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "PhoneRevealLog_visitId_staffId_createdAt_idx" ON "PhoneRevealLog"("visitId", "staffId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "FieldSale_staffId_activityDate_idx" ON "FieldSale"("staffId", "activityDate" DESC);

-- CreateIndex
CREATE INDEX "FieldSale_storeId_activityDate_idx" ON "FieldSale"("storeId", "activityDate" DESC);

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_fieldSaleId_fkey" FOREIGN KEY ("fieldSaleId") REFERENCES "FieldSale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_assignedStaffId_fkey" FOREIGN KEY ("assignedStaffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffCallLog" ADD CONSTRAINT "StaffCallLog_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffCallLog" ADD CONSTRAINT "StaffCallLog_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneRevealLog" ADD CONSTRAINT "PhoneRevealLog_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneRevealLog" ADD CONSTRAINT "PhoneRevealLog_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldSale" ADD CONSTRAINT "FieldSale_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldSale" ADD CONSTRAINT "FieldSale_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldSale" ADD CONSTRAINT "FieldSale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

