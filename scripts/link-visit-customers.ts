/**
 * Links Visit rows to Customer by matching phoneHash + storeId.
 * Run: npm run db:link-visits
 */
import { prisma } from "@/lib/db/prisma";

async function main() {
  const orphans = await prisma.visit.findMany({
    where: { customerId: null },
    select: { id: true, customerPhoneHash: true, storeId: true },
  });

  let linked = 0;
  for (const visit of orphans) {
    const customer = await prisma.customer.findUnique({
      where: {
        phoneHash_storeId: {
          phoneHash: visit.customerPhoneHash,
          storeId: visit.storeId,
        },
      },
      select: { id: true },
    });
    if (!customer) continue;

    await prisma.visit.update({
      where: { id: visit.id },
      data: { customerId: customer.id },
    });
    linked += 1;
  }

  console.log(`Linked ${linked} of ${orphans.length} visits without customerId`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
