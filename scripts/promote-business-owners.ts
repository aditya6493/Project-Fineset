/**
 * One-time data fix: promote owner logins from STORE_MANAGER to BUSINESS_OWNER.
 *
 * Usage: npx tsx scripts/promote-business-owners.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const result = await prisma.appUser.updateMany({
    where: {
      role: "STORE_MANAGER",
      staffId: null,
    },
    data: {
      role: "BUSINESS_OWNER",
    },
  });

  console.log(`Promoted ${result.count} owner login(s) to BUSINESS_OWNER`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
