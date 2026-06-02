import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const [customers, visits, fieldSales, followUps, callLogs] = await Promise.all([
    prisma.customer.count(),
    prisma.visit.count(),
    prisma.fieldSale.count(),
    prisma.followUp.count(),
    prisma.staffCallLog.count(),
  ]);

  const stores = await prisma.store.findMany({
    select: { id: true, name: true, city: true, isActive: true },
  });

  const staff = await prisma.staff.findMany({
    select: { name: true, employeeId: true, storeId: true },
  });

  const recentVisits = await prisma.visit.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      visitDate: true,
      customerName: true,
      purchaseStatus: true,
      createdAt: true,
    },
  });

  const recentFieldSales = await prisma.fieldSale.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      activityDate: true,
      customerName: true,
      enrollmentOutcome: true,
      createdAt: true,
    },
  });

  const recentCustomers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, createdAt: true },
  });

  console.log(
    JSON.stringify(
      {
        counts: { customers, visits, fieldSales, followUps, callLogs },
        stores,
        staff,
        recentVisits,
        recentFieldSales,
        recentCustomers,
      },
      null,
      2,
    ),
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
