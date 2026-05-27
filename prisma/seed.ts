import { PrismaClient } from "@prisma/client";
import { prepareCustomerPii } from "../lib/services/pii";

const prisma = new PrismaClient();

async function seedStore(data: {
  name: string;
  category: "JEWELRY" | "HANDBAGS" | "WATCHES" | "OTHER";
  city: string;
  state: string;
}) {
  return prisma.store.create({ data });
}

async function seedStaff(data: {
  name: string;
  employeeId: string;
  storeId: string;
}) {
  return prisma.staff.create({
    data: {
      name: data.name,
      employeeId: data.employeeId,
      role: "STAFF",
      storeId: data.storeId,
    },
  });
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function visitTime(hours: number, minutes: number, base = new Date()): Date {
  const date = new Date(base);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function customerPii(name: string, phone: string) {
  return prepareCustomerPii(name, phone);
}

async function main(): Promise<void> {
  await prisma.authAuditLog.deleteMany();
  await prisma.appUser.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.staffCallLog.deleteMany();
  await prisma.fieldSale.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.store.deleteMany();

  const storeAlpha = await seedStore({
    name: "Store Alpha",
    category: "JEWELRY",
    city: "Hyderabad",
    state: "Telangana",
  });

  const storeBeta = await seedStore({
    name: "Store Beta",
    category: "HANDBAGS",
    city: "Bengaluru",
    state: "Karnataka",
  });

  const staffA = await seedStaff({
    name: "Staff Member A",
    employeeId: "EMP001",
    storeId: storeAlpha.id,
  });

  const staffB = await seedStaff({
    name: "Staff Member B",
    employeeId: "EMP002",
    storeId: storeAlpha.id,
  });

  const staffC = await seedStaff({
    name: "Staff Member C",
    employeeId: "EMP003",
    storeId: storeBeta.id,
  });

  // ── Customers (Store Alpha) ──────────────────────────────────────────────

  const piiAnita = customerPii("Anita Reddy", "9810001001");
  const customerAnita = await prisma.customer.create({
    data: {
      ...piiAnita,
      area: "Banjara Hills",
      gender: "FEMALE",
      ageGroup: "36-50",
      storeId: storeAlpha.id,
    },
  });

  const piiKaran = customerPii("Karan Mehta", "9810001002");
  const customerKaran = await prisma.customer.create({
    data: {
      ...piiKaran,
      area: "Jubilee Hills",
      gender: "MALE",
      ageGroup: "26-35",
      storeId: storeAlpha.id,
    },
  });

  const piiPriya = customerPii("Priya Sharma", "9810001004");
  await prisma.customer.create({
    data: {
      ...piiPriya,
      area: "Gachibowli",
      gender: "FEMALE",
      ageGroup: "18-25",
      storeId: storeAlpha.id,
    },
  });

  const piiAmit = customerPii("Amit Verma", "9810001005");
  await prisma.customer.create({
    data: {
      ...piiAmit,
      area: "Madhapur",
      gender: "MALE",
      ageGroup: "36-50",
      storeId: storeAlpha.id,
    },
  });

  const piiVikram = customerPii("Vikram Singh", "9810001006");
  await prisma.customer.create({
    data: {
      ...piiVikram,
      area: "Hitech City",
      gender: "MALE",
      ageGroup: "50+",
      storeId: storeAlpha.id,
    },
  });

  const piiMeera = customerPii("Meera Patel", "9810001007");
  await prisma.customer.create({
    data: {
      ...piiMeera,
      area: "Kondapur",
      gender: "FEMALE",
      ageGroup: "26-35",
      storeId: storeAlpha.id,
    },
  });

  const piiRahul = customerPii("Rahul Kumar", "9810001008");
  await prisma.customer.create({
    data: {
      ...piiRahul,
      area: "Secunderabad",
      gender: "MALE",
      ageGroup: "26-35",
      storeId: storeAlpha.id,
    },
  });

  const piiSunita = customerPii("Sunita Iyer", "9810001009");
  await prisma.customer.create({
    data: {
      ...piiSunita,
      area: "Ameerpet",
      gender: "FEMALE",
      ageGroup: "36-50",
      storeId: storeAlpha.id,
    },
  });

  const piiDeepa = customerPii("Deepa Nair", "9810001010");
  await prisma.customer.create({
    data: {
      ...piiDeepa,
      area: "Kukatpally",
      gender: "FEMALE",
      ageGroup: "26-35",
      storeId: storeAlpha.id,
    },
  });

  // ── Staff A visits — retention & follow-up call queues ─────────────────────

  const visitAnita = await prisma.visit.create({
    data: {
      storeId: storeAlpha.id,
      staffId: staffA.id,
      customerId: customerAnita.id,
      customerName: piiAnita.name,
      customerPhone: piiAnita.phone,
      customerPhoneHash: piiAnita.phoneHash,
      visitDate: daysAgo(2),
      inTime: visitTime(11, 15, daysAgo(2)),
      outTime: visitTime(12, 5, daysAgo(2)),
      durationMins: 50,
      customerType: "REPEAT",
      visitType: "WALK_IN",
      purchaseStatus: "PURCHASED",
      productsExplored: ["RINGS", "NECKLACES"],
      productsPurchased: ["RINGS"],
      transactionAmount: 72000,
      intentTier: "HOT",
      purchaseOccasion: "ANNIVERSARY",
      metalKtPref: "GOLD_22KT",
      budgetStated: "K50_1L",
      sourceChannel: "REFERRAL",
      area: "Banjara Hills",
    },
  });

  await prisma.visit.create({
    data: {
      storeId: storeAlpha.id,
      staffId: staffA.id,
      customerName: piiPriya.name,
      customerPhone: piiPriya.phone,
      customerPhoneHash: piiPriya.phoneHash,
      visitDate: daysAgo(1),
      inTime: visitTime(14, 30, daysAgo(1)),
      outTime: visitTime(15, 10, daysAgo(1)),
      durationMins: 40,
      customerType: "NEW",
      visitType: "WALK_IN",
      purchaseStatus: "NOT_PURCHASED",
      productsExplored: ["NECKLACES", "EARRINGS"],
      productsPurchased: [],
      intentTier: "HOT",
      reasonNoPurchase: "EXPLORING",
      budgetStated: "K50_1L",
      sourceChannel: "SOCIAL_MEDIA",
      area: "Gachibowli",
    },
  });

  await prisma.visit.create({
    data: {
      storeId: storeAlpha.id,
      staffId: staffA.id,
      customerName: piiAmit.name,
      customerPhone: piiAmit.phone,
      customerPhoneHash: piiAmit.phoneHash,
      visitDate: daysAgo(3),
      inTime: visitTime(16, 0, daysAgo(3)),
      outTime: visitTime(16, 25, daysAgo(3)),
      durationMins: 25,
      customerType: "REPEAT",
      visitType: "APPOINTMENT",
      purchaseStatus: "NOT_PURCHASED",
      productsExplored: ["CHAINS"],
      productsPurchased: [],
      intentTier: "COLD",
      reasonNoPurchase: "BUDGET",
      budgetStated: "UNDER_15K",
      sourceChannel: "REFERRAL",
      area: "Madhapur",
    },
  });

  await prisma.visit.create({
    data: {
      storeId: storeAlpha.id,
      staffId: staffA.id,
      customerName: piiVikram.name,
      customerPhone: piiVikram.phone,
      customerPhoneHash: piiVikram.phoneHash,
      visitDate: daysAgo(5),
      inTime: visitTime(12, 0, daysAgo(5)),
      outTime: visitTime(13, 20, daysAgo(5)),
      durationMins: 80,
      customerType: "VIP",
      visitType: "APPOINTMENT",
      purchaseStatus: "PURCHASED",
      productsExplored: ["SETS", "BANGLES"],
      productsPurchased: ["SETS"],
      transactionAmount: 125000,
      intentTier: "HOT",
      purchaseOccasion: "WEDDING",
      metalKtPref: "GOLD_22KT",
      budgetStated: "ABOVE_1L",
      sourceChannel: "PHONE",
      area: "Hitech City",
    },
  });

  const visitMeera = await prisma.visit.create({
    data: {
      storeId: storeAlpha.id,
      staffId: staffA.id,
      customerName: piiMeera.name,
      customerPhone: piiMeera.phone,
      customerPhoneHash: piiMeera.phoneHash,
      visitDate: daysAgo(4),
      inTime: visitTime(10, 45, daysAgo(4)),
      outTime: visitTime(11, 30, daysAgo(4)),
      durationMins: 45,
      customerType: "NEW",
      visitType: "WALK_IN",
      purchaseStatus: "NOT_PURCHASED",
      productsExplored: ["BANGLES", "EARRINGS"],
      productsPurchased: [],
      intentTier: "WARM",
      reasonNoPurchase: "DESIGN_NOT_LIKED",
      budgetStated: "K15_50K",
      followUpNeeded: true,
      followUpDate: daysFromNow(1),
      sourceChannel: "ORGANIC_WALK_IN",
      area: "Kondapur",
    },
  });

  await prisma.followUp.create({
    data: {
      visitId: visitMeera.id,
      assignedStaffId: staffA.id,
      followUpDate: daysFromNow(1),
      reason: "Design alternatives follow-up",
      status: "OPEN",
      callOutcome: "NOT_ANSWERED",
      outcomeDate: daysAgo(1),
    },
  });

  await prisma.staffCallLog.create({
    data: {
      visitId: visitMeera.id,
      staffId: staffA.id,
      answered: "NOT_ANSWERED",
      feedback: "Rang twice, no answer",
    },
  });

  const visitRahul = await prisma.visit.create({
    data: {
      storeId: storeAlpha.id,
      staffId: staffA.id,
      customerName: piiRahul.name,
      customerPhone: piiRahul.phone,
      customerPhoneHash: piiRahul.phoneHash,
      visitDate: daysAgo(6),
      inTime: visitTime(15, 0, daysAgo(6)),
      outTime: visitTime(15, 40, daysAgo(6)),
      durationMins: 40,
      customerType: "NEW",
      visitType: "WALK_IN",
      purchaseStatus: "NOT_PURCHASED",
      productsExplored: ["RINGS"],
      productsPurchased: [],
      intentTier: "WARM",
      reasonNoPurchase: "WILL_VISIT_AGAIN",
      budgetStated: "K15_50K",
      followUpNeeded: true,
      followUpDate: daysFromNow(3),
      sourceChannel: "INTERNET",
      area: "Secunderabad",
    },
  });

  await prisma.staffCallLog.create({
    data: {
      visitId: visitRahul.id,
      staffId: staffA.id,
      answered: "ANSWERED",
      feedback: "Interested in ring designs, asked to call back next week",
    },
  });

  const visitSunita = await prisma.visit.create({
    data: {
      storeId: storeAlpha.id,
      staffId: staffA.id,
      customerName: piiSunita.name,
      customerPhone: piiSunita.phone,
      customerPhoneHash: piiSunita.phoneHash,
      visitDate: daysAgo(7),
      inTime: visitTime(11, 0, daysAgo(7)),
      outTime: visitTime(11, 50, daysAgo(7)),
      durationMins: 50,
      customerType: "REPEAT",
      visitType: "WALK_IN",
      purchaseStatus: "NOT_PURCHASED",
      productsExplored: ["PENDANTS", "NECKLACES"],
      productsPurchased: [],
      intentTier: "HOT",
      reasonNoPurchase: "COMPETITOR",
      competitorMention: "Tanishq",
      budgetStated: "K50_1L",
      followUpNeeded: true,
      followUpDate: daysFromNow(2),
      sourceChannel: "TANISHQ_REF",
      area: "Ameerpet",
    },
  });

  await prisma.followUp.create({
    data: {
      visitId: visitSunita.id,
      assignedStaffId: staffA.id,
      followUpDate: daysFromNow(2),
      reason: "Competitor comparison follow-up",
      status: "OPEN",
    },
  });

  await prisma.visit.create({
    data: {
      storeId: storeAlpha.id,
      staffId: staffA.id,
      customerName: piiDeepa.name,
      customerPhone: piiDeepa.phone,
      customerPhoneHash: piiDeepa.phoneHash,
      visitDate: daysAgo(1),
      inTime: visitTime(17, 15, daysAgo(1)),
      outTime: visitTime(17, 45, daysAgo(1)),
      durationMins: 30,
      customerType: "NEW",
      visitType: "WALK_IN",
      purchaseStatus: "NOT_PURCHASED",
      productsExplored: ["EARRINGS"],
      productsPurchased: [],
      intentTier: "BROWSING",
      reasonNoPurchase: "EXPLORING",
      budgetStated: "UNDER_15K",
      sourceChannel: "ORGANIC_WALK_IN",
      area: "Kukatpally",
    },
  });

  // ── Staff B visit (Store Alpha) ────────────────────────────────────────────

  const visitKaran = await prisma.visit.create({
    data: {
      storeId: storeAlpha.id,
      staffId: staffB.id,
      customerId: customerKaran.id,
      customerName: piiKaran.name,
      customerPhone: piiKaran.phone,
      customerPhoneHash: piiKaran.phoneHash,
      visitDate: daysAgo(2),
      inTime: visitTime(13, 0, daysAgo(2)),
      outTime: visitTime(13, 35, daysAgo(2)),
      durationMins: 35,
      customerType: "NEW",
      visitType: "WALK_IN",
      purchaseStatus: "NOT_PURCHASED",
      productsExplored: ["BANGLES", "EARRINGS"],
      productsPurchased: [],
      intentTier: "WARM",
      reasonNoPurchase: "BUDGET",
      budgetStated: "UNDER_15K",
      followUpNeeded: true,
      followUpDate: daysFromNow(3),
      sourceChannel: "ORGANIC_WALK_IN",
      area: "Jubilee Hills",
    },
  });

  await prisma.followUp.create({
    data: {
      visitId: visitKaran.id,
      assignedStaffId: staffB.id,
      followUpDate: daysFromNow(3),
      reason: "Budget follow-up",
      status: "OPEN",
    },
  });

  // ── Staff C visit (Store Beta) ─────────────────────────────────────────────

  const piiCustomerC = customerPii("Lakshmi Rao", "9810001003");
  await prisma.customer.create({
    data: {
      ...piiCustomerC,
      area: "Indiranagar",
      gender: "FEMALE",
      ageGroup: "18-25",
      storeId: storeBeta.id,
    },
  });

  await prisma.visit.create({
    data: {
      storeId: storeBeta.id,
      staffId: staffC.id,
      customerName: piiCustomerC.name,
      customerPhone: piiCustomerC.phone,
      customerPhoneHash: piiCustomerC.phoneHash,
      visitDate: daysAgo(3),
      inTime: visitTime(12, 30, daysAgo(3)),
      outTime: visitTime(13, 0, daysAgo(3)),
      durationMins: 30,
      customerType: "VIP",
      visitType: "APPOINTMENT",
      purchaseStatus: "NOT_PURCHASED",
      productsExplored: ["SETS"],
      productsPurchased: [],
      intentTier: "HOT",
      budgetStated: "ABOVE_1L",
      sourceChannel: "PHONE",
      area: "Indiranagar",
    },
  });

  // ── Field sales (Staff A — GHS / GPP) ─────────────────────────────────────

  const piiField1 = customerPii("Rajesh Naidu", "9810002001");
  await prisma.fieldSale.create({
    data: {
      storeId: storeAlpha.id,
      staffId: staffA.id,
      customerName: piiField1.name,
      customerPhone: piiField1.phone,
      customerPhoneHash: piiField1.phoneHash,
      activityDate: daysAgo(1),
      startTime: visitTime(10, 0, daysAgo(1)),
      endTime: visitTime(10, 35, daysAgo(1)),
      durationMins: 35,
      customerType: "NEW",
      area: "Miyapur",
      gender: "MALE",
      ageGroup: "36-50",
      profession: "Shop owner",
      activityType: "HOUSING_SOCIETY",
      locationLabel: "Lake View Apartments",
      schemesPitched: ["GHS"],
      enrollmentOutcome: "ENROLLED_GHS",
      monthlyCommitment: 5000,
      intentTier: "HOT",
    },
  });

  const piiField2 = customerPii("Sneha Gupta", "9810002002");
  await prisma.fieldSale.create({
    data: {
      storeId: storeAlpha.id,
      staffId: staffA.id,
      customerName: piiField2.name,
      customerPhone: piiField2.phone,
      customerPhoneHash: piiField2.phoneHash,
      activityDate: daysAgo(2),
      startTime: visitTime(16, 30, daysAgo(2)),
      endTime: visitTime(17, 0, daysAgo(2)),
      durationMins: 30,
      customerType: "NEW",
      area: "Kukatpally",
      gender: "FEMALE",
      ageGroup: "26-35",
      profession: "IT professional",
      activityType: "DOOR_TO_DOOR",
      locationLabel: "Phase 2, Street 4",
      schemesPitched: ["GHS", "GPP"],
      enrollmentOutcome: "INTERESTED",
      intentTier: "WARM",
      followUpNeeded: true,
      followUpDate: daysFromNow(2),
      staffNotes: "Wants to compare GPP vs GHS before deciding",
    },
  });

  console.log("Seed complete:", {
    stores: 2,
    staff: 3,
    customers: 10,
    visitsForStaffA: 8,
    visitsTotal: 10,
    fieldSalesForStaffA: 2,
    followUps: 3,
    callLogs: 2,
    loginHint: "Run npm run auth:bootstrap-dev after seed for Supabase login accounts",
    sampleVisitId: visitAnita.id,
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
