/**
 * Staff calls queue mock data for local dev (Store Alpha / EMP001).
 *
 * Creates current-month visits and field sales covering retention, not-answered,
 * follow-up, external, and value-tier filters. Customer names are stored in full
 * (not masked) for UI testing.
 *
 * Usage:
 *   npm run db:seed && npm run auth:bootstrap-dev && npm run db:seed:staff-calls
 *
 * Login: staff-a@store-alpha.local / FineSet#1dev
 */
import { PrismaClient } from "@prisma/client";
import { fieldSaleDenormFields, visitDenormFields } from "../lib/services/call-record-denorm";
import { prepareCustomerPii } from "../lib/services/pii";

const prisma = new PrismaClient();

const DEV_PHONE_PREFIX = "9810999";
const STORE_NAME = "Store Alpha";
const STAFF_EMPLOYEE_ID = "EMP001";

function dayInCurrentMonth(day: number, hour = 11, minute = 0): Date {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const safeDay = Math.min(Math.max(day, 1), lastDay);
  return new Date(now.getFullYear(), now.getMonth(), safeDay, hour, minute, 0, 0);
}

function devPhone(suffix: string): string {
  return `${DEV_PHONE_PREFIX}${suffix}`;
}

const DEV_PHONE_SUFFIXES = ["001", "002", "003", "004", "005"] as const;

async function clearPreviousDevMocks(staffId: string): Promise<void> {
  const devPhoneHashes = DEV_PHONE_SUFFIXES.map(
    (suffix) => prepareCustomerPii("cleanup", devPhone(suffix)).phoneHash,
  );

  const devVisits = await prisma.visit.findMany({
    where: { staffId, customerPhoneHash: { in: devPhoneHashes } },
    select: { id: true },
  });
  const devFieldSales = await prisma.fieldSale.findMany({
    where: { staffId, customerPhoneHash: { in: devPhoneHashes } },
    select: { id: true },
  });

  const visitIds = devVisits.map((v) => v.id);
  const fieldSaleIds = devFieldSales.map((f) => f.id);

  if (visitIds.length > 0) {
    await prisma.staffCallLog.deleteMany({ where: { visitId: { in: visitIds } } });
    await prisma.followUp.deleteMany({ where: { visitId: { in: visitIds } } });
    await prisma.visit.deleteMany({ where: { id: { in: visitIds } } });
  }

  if (fieldSaleIds.length > 0) {
    await prisma.staffCallLog.deleteMany({ where: { fieldSaleId: { in: fieldSaleIds } } });
    await prisma.followUp.deleteMany({ where: { fieldSaleId: { in: fieldSaleIds } } });
    await prisma.fieldSale.deleteMany({ where: { id: { in: fieldSaleIds } } });
  }
}

async function main(): Promise<void> {
  const store = await prisma.store.findFirst({
    where: { name: { equals: STORE_NAME, mode: "insensitive" } },
  });
  if (!store) {
    throw new Error(`Store "${STORE_NAME}" not found. Run npm run db:seed first.`);
  }

  const staff = await prisma.staff.findUnique({ where: { employeeId: STAFF_EMPLOYEE_ID } });
  if (!staff || staff.storeId !== store.id) {
    throw new Error(`Staff ${STAFF_EMPLOYEE_ID} not found for ${STORE_NAME}. Run npm run db:seed first.`);
  }

  await clearPreviousDevMocks(staff.id);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const visitDate = dayInCurrentMonth(10, 10, 0);
  const birthdayThisMonth = new Date(year, month - 1, 12);

  const retentionPii = prepareCustomerPii("Ravi Shankar", devPhone("001"));
  const visitRetention = await prisma.visit.create({
    data: {
      storeId: store.id,
      staffId: staff.id,
      visitDate,
      customerName: retentionPii.name,
      customerPhone: retentionPii.phone,
      customerPhoneHash: retentionPii.phoneHash,
      customerNameSearch: retentionPii.customerNameSearch,
      phoneLast4: retentionPii.phoneLast4,
      customerType: "NEW",
      visitType: "WALK_IN",
      purchaseStatus: "NOT_PURCHASED",
      productsExplored: ["FINGER_RINGS"],
      productsPurchased: [],
      sourceChannel: "ORGANIC_WALK_IN",
      followUpNeeded: false,
      dateOfBirth: birthdayThisMonth,
      ...visitDenormFields({
        transactionAmount: null,
        budgetStated: "UNDER_15K",
        purchaseStatus: "NOT_PURCHASED",
        dateOfBirth: birthdayThisMonth,
        anniversary: null,
      }),
    },
  });

  const notAnsweredPii = prepareCustomerPii("Lakshmi Venkatesh", devPhone("002"));
  const visitNotAnswered = await prisma.visit.create({
    data: {
      storeId: store.id,
      staffId: staff.id,
      visitDate,
      customerName: notAnsweredPii.name,
      customerPhone: notAnsweredPii.phone,
      customerPhoneHash: notAnsweredPii.phoneHash,
      customerNameSearch: notAnsweredPii.customerNameSearch,
      phoneLast4: notAnsweredPii.phoneLast4,
      customerType: "NEW",
      visitType: "WALK_IN",
      purchaseStatus: "NOT_PURCHASED",
      productsExplored: ["BANGLES"],
      productsPurchased: [],
      sourceChannel: "ORGANIC_WALK_IN",
      followUpNeeded: true,
      lastCallAnswered: "NOT_ANSWERED",
      lastCallAt: visitDate,
      ...visitDenormFields({
        transactionAmount: null,
        budgetStated: "K15_50K",
        purchaseStatus: "NOT_PURCHASED",
        dateOfBirth: null,
        anniversary: null,
      }),
    },
  });

  await prisma.staffCallLog.create({
    data: {
      visitId: visitNotAnswered.id,
      staffId: staff.id,
      answered: "NOT_ANSWERED",
      feedback: "No answer after two rings",
    },
  });

  const followUpPii = prepareCustomerPii("Arjun Malhotra", devPhone("003"));
  const visitFollowUp = await prisma.visit.create({
    data: {
      storeId: store.id,
      staffId: staff.id,
      visitDate,
      customerName: followUpPii.name,
      customerPhone: followUpPii.phone,
      customerPhoneHash: followUpPii.phoneHash,
      customerNameSearch: followUpPii.customerNameSearch,
      phoneLast4: followUpPii.phoneLast4,
      customerType: "REPEAT",
      visitType: "WALK_IN",
      purchaseStatus: "PURCHASED",
      productsExplored: ["NECKLACE"],
      productsPurchased: ["NECKLACE"],
      transactionAmount: 85_000,
      sourceChannel: "ORGANIC_WALK_IN",
      followUpNeeded: true,
      ...visitDenormFields({
        transactionAmount: 85_000,
        budgetStated: "K50_1L",
        purchaseStatus: "PURCHASED",
        dateOfBirth: null,
        anniversary: null,
      }),
    },
  });

  await prisma.followUp.create({
    data: {
      visitId: visitFollowUp.id,
      assignedStaffId: staff.id,
      followUpDate: dayInCurrentMonth(20, 10, 0),
      status: "OPEN",
      reason: "Post-purchase satisfaction check",
    },
  });

  const externalPii = prepareCustomerPii("Nisha Kapoor", devPhone("004"));
  const visitExternal = await prisma.visit.create({
    data: {
      storeId: store.id,
      staffId: staff.id,
      visitDate,
      customerName: externalPii.name,
      customerPhone: externalPii.phone,
      customerPhoneHash: externalPii.phoneHash,
      customerNameSearch: externalPii.customerNameSearch,
      phoneLast4: externalPii.phoneLast4,
      customerType: "VIP",
      visitType: "APPOINTMENT",
      purchaseStatus: "NOT_PURCHASED",
      productsExplored: ["CHAINS"],
      productsPurchased: [],
      sourceChannel: "REFERRAL",
      followUpNeeded: false,
      ...visitDenormFields({
        transactionAmount: null,
        budgetStated: "ABOVE_1L",
        purchaseStatus: "NOT_PURCHASED",
        dateOfBirth: null,
        anniversary: null,
      }),
    },
  });

  const fieldPii = prepareCustomerPii("Suresh Babu", devPhone("005"));
  const fieldSaleNotAnswered = await prisma.fieldSale.create({
    data: {
      storeId: store.id,
      staffId: staff.id,
      activityDate: visitDate,
      customerName: fieldPii.name,
      customerPhone: fieldPii.phone,
      customerPhoneHash: fieldPii.phoneHash,
      customerNameSearch: fieldPii.customerNameSearch,
      phoneLast4: fieldPii.phoneLast4,
      customerType: "NEW",
      activityType: "DOOR_TO_DOOR",
      area: "Miyapur",
      followUpNeeded: false,
      monthlyCommitment: 25_000,
      lastCallAnswered: "NOT_ANSWERED",
      lastCallAt: visitDate,
      ...fieldSaleDenormFields({
        monthlyCommitment: 25_000,
        dateOfBirth: null,
        anniversary: null,
      }),
    },
  });

  await prisma.staffCallLog.create({
    data: {
      fieldSaleId: fieldSaleNotAnswered.id,
      staffId: staff.id,
      answered: "NOT_ANSWERED",
      feedback: "Voicemail",
    },
  });

  console.log("Staff calls dev seed complete:", {
    store: STORE_NAME,
    staff: STAFF_EMPLOYEE_ID,
    year,
    month,
    login: "staff-a@store-alpha.local / FineSet#1dev",
    records: {
      retention: visitRetention.id,
      notAnswered: visitNotAnswered.id,
      followUp: visitFollowUp.id,
      external: visitExternal.id,
      fieldSaleNotAnswered: fieldSaleNotAnswered.id,
    },
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
