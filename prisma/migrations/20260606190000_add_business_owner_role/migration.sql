-- AlterEnum (must be committed before BUSINESS_OWNER can be used in DML)
ALTER TYPE "AppRole" ADD VALUE IF NOT EXISTS 'BUSINESS_OWNER';
