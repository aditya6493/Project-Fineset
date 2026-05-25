import { PrismaClient } from "@prisma/client";
import { hashPhone } from "../lib/services/pii";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.followUp.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.store.deleteMany();

  const storeAlpha = await prisma.store.create({
    data: {
      name: "Store Alpha",
      city: "City A",
      state: "State A",
      pincode: "500001",
    },
  });

  const storeBeta = await prisma.store.create({
    data: {
      name: "Store Beta",
      city: "City B",
      state: "State B",
      pincode: "500002",
    },
  });

  const staffA = await prisma.staff.create({
    data: {
      name: "Staff Member A",
      employeeId: "EMP001",
      role: "STAFF",
      storeId: storeAlpha.id,
    },
  });

  const staffB = await prisma.staff.create({
    data: {
      name: "Staff Member B",
      employeeId: "EMP002",
      role: "STAFF",
      storeId: storeAlpha.id,
    },
  });

  await prisma.staff.create({
    data: {
      name: "Staff Member C",
      employeeId: "EMP003",
      role: "STAFF",
      storeId: storeBeta.id,
    },
  });

  const customerA = await prisma.customer.create({
    data: {
      name: "Customer A",
      phone: "9810001001",
      phoneHash: hashPhone("9810001001"),
      area: "Area North",
      gender: "FEMALE",
      ageGroup: "26-35",
      storeId: storeAlpha.id,
    },
  });

  const customerB = await prisma.customer.create({
    data: {
      name: "Customer B",
      phone: "9810001002",
      phoneHash: hashPhone("9810001002"),
      area: "Area South",
      gender: "MALE",
      ageGroup: "36-50",
      storeId: storeAlpha.id,
    },
  });

  await prisma.customer.create({
    data: {
      name: "Customer C",
      phone: "9810001003",
      phoneHash: hashPhone("9810001003"),
      area: "Area East",
      gender: "FEMALE",
      ageGroup: "18-25",
      storeId: storeBeta.id,
    },
  });

  const visit1 = await prisma.visit.create({
    data: {
      storeId: storeAlpha.id,
      staffId: staffA.id,
      customerId: customerA.id,
      customerName: customerA.name,
      customerPhone: customerA.phone,
      customerPhoneHash: hashPhone("9810001001"),
      customerType: "REPEAT",
      visitType: "WALK_IN",
      purchaseStatus: "PURCHASED",
      productsExplored: ["RINGS", "NECKLACES"],
      productsPurchased: ["RINGS"],
      transactionAmount: 45000,
      intentTier: "HOT",
      purchaseOccasion: "ANNIVERSARY",
      metalKtPref: "GOLD_22KT",
      budgetStated: "K15_50K",
      sourceChannel: "REFERRAL",
      inTime: new Date(),
    },
  });

  const visit2 = await prisma.visit.create({
    data: {
      storeId: storeAlpha.id,
      staffId: staffB.id,
      customerId: customerB.id,
      customerName: customerB.name,
      customerPhone: customerB.phone,
      customerPhoneHash: hashPhone("9810001002"),
      customerType: "NEW",
      visitType: "WALK_IN",
      purchaseStatus: "NOT_PURCHASED",
      productsExplored: ["BANGLES", "EARRINGS"],
      productsPurchased: [],
      intentTier: "WARM",
      reasonNoPurchase: "BUDGET",
      budgetStated: "UNDER_15K",
      followUpNeeded: true,
      followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      sourceChannel: "ORGANIC_WALK_IN",
      inTime: new Date(),
    },
  });

  await prisma.followUp.create({
    data: {
      visitId: visit2.id,
      assignedStaffId: staffB.id,
      followUpDate: visit2.followUpDate!,
      reason: "Budget follow-up",
      status: "OPEN",
    },
  });

  await prisma.visit.create({
    data: {
      storeId: storeBeta.id,
      staffId: (
        await prisma.staff.findFirstOrThrow({ where: { storeId: storeBeta.id } })
      ).id,
      customerName: "Customer C",
      customerPhone: "9810001003",
      customerPhoneHash: hashPhone("9810001003"),
      customerType: "VIP",
      visitType: "APPOINTMENT",
      purchaseStatus: "PENDING",
      productsExplored: ["SETS"],
      productsPurchased: [],
      intentTier: "HOT",
      sourceChannel: "PHONE",
      inTime: new Date(),
    },
  });

  console.log("Seed complete:", {
    stores: 2,
    staff: 3,
    customers: 3,
    visits: 3,
    followUps: 1,
    sampleVisit: visit1.id,
  });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
