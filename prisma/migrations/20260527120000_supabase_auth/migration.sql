-- CreateEnum
CREATE TYPE "AppRole" AS ENUM ('MASTER_ADMIN', 'STORE_MANAGER', 'STAFF');

-- AlterTable
ALTER TABLE "Store" ALTER COLUMN "pincodeHash" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Staff" ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateTable
CREATE TABLE "AppUser" (
    "id" TEXT NOT NULL,
    "authId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "AppRole" NOT NULL,
    "storeId" TEXT,
    "staffId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "invitedAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthAuditLog" (
    "id" TEXT NOT NULL,
    "authId" TEXT,
    "email" TEXT,
    "event" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_authId_key" ON "AppUser"("authId");

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_email_key" ON "AppUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_staffId_key" ON "AppUser"("staffId");

-- CreateIndex
CREATE INDEX "AppUser_storeId_role_isActive_idx" ON "AppUser"("storeId", "role", "isActive");

-- CreateIndex
CREATE INDEX "AppUser_email_idx" ON "AppUser"("email");

-- CreateIndex
CREATE INDEX "AuthAuditLog_email_createdAt_idx" ON "AuthAuditLog"("email", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AuthAuditLog_event_createdAt_idx" ON "AuthAuditLog"("event", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "AppUser" ADD CONSTRAINT "AppUser_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppUser" ADD CONSTRAINT "AppUser_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
