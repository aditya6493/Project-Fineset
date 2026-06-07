-- Promote owner logins (no staff record) from STORE_MANAGER to BUSINESS_OWNER
UPDATE "AppUser"
SET role = 'BUSINESS_OWNER'
WHERE role = 'STORE_MANAGER' AND "staffId" IS NULL;
