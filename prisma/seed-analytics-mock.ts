/**
 * LOCAL ONLY — Analytics dashboard mock data.
 * Remove this file and `db:seed:analytics` from package.json when done testing.
 *
 * Usage: npm run db:seed:analytics
 * Requires at least one store with staff (run `npm run db:seed` first if empty).
 *
 * Visits are tagged with staffNotes = "ANALYTICS_MOCK" for idempotent re-runs.
 */

import {
  BudgetRange,
  CustomerType,
  IntentTier,
  Prisma,
  PrismaClient,
  PurchaseStatus,
  SchemeEnrollmentOutcome,
  SchemeProduct,
  SourceChannel,
  VisitType,
} from "@prisma/client";
import { prepareCustomerPii } from "../lib/services/pii";

const prisma = new PrismaClient();

const MOCK_TAG = "ANALYTICS_MOCK";

const CUSTOMER_TYPES: CustomerType[] = ["NEW", "REPEAT", "VIP"];
const INTENT_TIERS: (IntentTier | null)[] = ["HOT", "WARM", "COLD", "BROWSING", null];
const PURCHASE_STATUSES: PurchaseStatus[] = ["PURCHASED", "NOT_PURCHASED", "PENDING"];
const VISIT_TYPES: VisitType[] = ["WALK_IN", "APPOINTMENT"];
const SOURCE_CHANNELS: SourceChannel[] = [
  "ORGANIC_WALK_IN",
  "REFERRAL",
  "SOCIAL_MEDIA",
  "INTERNET",
  "PHONE",
  "OTHER",
];
const GENDERS: (string | null)[] = ["MALE", "FEMALE", "OTHER", null];
const AGE_GROUPS: (string | null)[] = ["18-25", "26-35", "36-50", "50+", null];
const AREAS = [
  "Banjara Hills",
  "Jubilee Hills",
  "Gachibowli",
  "Indiranagar",
  "Koramangala",
  null,
];
const BUDGETS: (BudgetRange | null)[] = [
  "UNDER_15K",
  "K15_50K",
  "K50_1L",
  "ABOVE_1L",
  "NOT_STATED",
  null,
];
const PRODUCTS = ["RINGS", "NECKLACES", "BANGLES", "EARRINGS", "CHAINS", "PENDANTS"];
const SCHEME_OUTCOMES: (SchemeEnrollmentOutcome | null)[] = [
  "ENROLLED_GHS",
  "ENROLLED_GPP",
  "INTERESTED",
  "DECLINED",
  "CALLBACK",
  null,
];

function pick<T>(items: readonly T[], index: number): T {
  return items[index % items.length]!;
}

function visitAt(year: number, month: number, day: number, hour = 11): Date {
  return new Date(year, month - 1, day, hour, 0, 0, 0);
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(10 + (days % 6), 15, 0, 0);
  return date;
}

function revenueForIndex(index: number): number | null {
  if (index % 3 !== 0) return null;
  return pick([8500, 22000, 48000, 95000, 145000], index);
}

async function cleanupPreviousMock(): Promise<void> {
  await prisma.fieldSale.deleteMany({ where: { staffNotes: MOCK_TAG } });
  await prisma.visit.deleteMany({ where: { staffNotes: MOCK_TAG } });
}

async function main(): Promise<void> {
  await cleanupPreviousMock();

  // Raw reads so this works even if local DB is behind latest Prisma migrations.
  const storeRows = await prisma.$queryRaw<{ id: string; name: string }[]>`
    SELECT id, name FROM "Store" WHERE "isActive" = true ORDER BY name ASC LIMIT 4
  `;
  const staffRows = await prisma.$queryRaw<{ id: string; storeId: string }[]>`
    SELECT id, "storeId" FROM "Staff" WHERE "isActive" = true ORDER BY name ASC
  `;

  const storesWithStaff = storeRows
    .map((store) => ({
      ...store,
      staff: staffRows.filter((staff) => staff.storeId === store.id),
    }))
    .filter((store) => store.staff.length > 0);
  if (storesWithStaff.length === 0) {
    console.error(
      "No stores with active staff found. Run `npm run db:seed` first, then retry.",
    );
    process.exit(1);
  }

  const visitPayloads: Prisma.VisitCreateManyInput[] = [];
  let counter = 0;

  function addVisitsForMonth(
    year: number,
    month: number,
    storeId: string,
    staffIds: string[],
    count: number,
    revenueMultiplier = 1,
  ) {
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let i = 0; i < count; i += 1) {
      const day = 1 + (i % daysInMonth);
      const index = counter;
      counter += 1;

      const purchased = index % 3 === 0;
      const baseRevenue = revenueForIndex(index);
      const pii = prepareCustomerPii(
        `Analytics Mock ${year}${String(month).padStart(2, "0")}-${index + 1}`,
        `9900${String(100000 + index).slice(-6)}`,
      );

      const schemesPitched: SchemeProduct[] =
        index % 5 === 0 ? [] : index % 2 === 0 ? ["GHS"] : ["GHS", "GPP"];

      visitPayloads.push({
        storeId,
        staffId: pick(staffIds, index),
        visitDate: visitAt(year, month, day, 10 + (index % 7)),
        customerName: pii.name,
        customerPhone: pii.phone,
        customerPhoneHash: pii.phoneHash,
        customerType: pick(CUSTOMER_TYPES, index),
        visitType: pick(VISIT_TYPES, index),
        purchaseStatus: purchased ? "PURCHASED" : pick(PURCHASE_STATUSES, index + 1),
        productsExplored: [pick(PRODUCTS, index), pick(PRODUCTS, index + 2)],
        productsPurchased: purchased ? [pick(PRODUCTS, index)] : [],
        transactionAmount: purchased && baseRevenue ? baseRevenue * revenueMultiplier : null,
        intentTier: pick(INTENT_TIERS, index),
        budgetStated: pick(BUDGETS, index),
        gender: pick(GENDERS, index),
        ageGroup: pick(AGE_GROUPS, index),
        area: pick(AREAS, index),
        sourceChannel: pick(SOURCE_CHANNELS, index),
        schemesPitched,
        schemeEnrolled: schemesPitched.length > 0 && index % 4 === 0,
        enrollmentOutcome: pick(SCHEME_OUTCOMES, index),
        staffNotes: MOCK_TAG,
      });
    }
  }

  const primary = storesWithStaff[0]!;
  const secondary = storesWithStaff[1] ?? primary;
  const primaryStaff = primary.staff.map((member) => member.id);
  const secondaryStaff = secondary.staff.map((member) => member.id);

  // May 2025 vs May 2026 — month comparison
  addVisitsForMonth(2025, 5, primary.id, primaryStaff, 45, 1);
  addVisitsForMonth(2025, 5, secondary.id, secondaryStaff, 25, 1);
  addVisitsForMonth(2026, 5, primary.id, primaryStaff, 58, 1.12);
  addVisitsForMonth(2026, 5, secondary.id, secondaryStaff, 32, 1.08);

  // Last 90 days — preset ranges
  for (let day = 0; day < 90; day += 1) {
    const store = day % 2 === 0 ? primary : secondary;
    const staffIds = store.staff.map((member) => member.id);
    const index = counter;
    counter += 1;
    const purchased = index % 4 === 0;
    const pii = prepareCustomerPii(`Analytics Recent ${day}`, `9811${String(200000 + day).slice(-6)}`);
    const schemesPitched: SchemeProduct[] = day % 6 === 0 ? [] : ["GPP"];

    visitPayloads.push({
      storeId: store.id,
      staffId: pick(staffIds, day),
      visitDate: daysAgo(day),
      customerName: pii.name,
      customerPhone: pii.phone,
      customerPhoneHash: pii.phoneHash,
      customerType: pick(CUSTOMER_TYPES, day),
      visitType: pick(VISIT_TYPES, day),
      purchaseStatus: purchased ? "PURCHASED" : "NOT_PURCHASED",
      productsExplored: [pick(PRODUCTS, day)],
      productsPurchased: purchased ? [pick(PRODUCTS, day + 1)] : [],
      transactionAmount: purchased ? pick([12000, 35000, 78000], day) : null,
      intentTier: pick(INTENT_TIERS, day),
      budgetStated: pick(BUDGETS, day),
      gender: pick(GENDERS, day),
      ageGroup: pick(AGE_GROUPS, day),
      area: pick(AREAS, day),
      sourceChannel: pick(SOURCE_CHANNELS, day),
      schemesPitched,
      schemeEnrolled: false,
      enrollmentOutcome: pick(SCHEME_OUTCOMES, day),
      staffNotes: MOCK_TAG,
    });
  }

  const BATCH = 50;
  for (let i = 0; i < visitPayloads.length; i += BATCH) {
    await prisma.visit.createMany({ data: visitPayloads.slice(i, i + BATCH) });
  }

  const fieldSalePayloads: Prisma.FieldSaleCreateManyInput[] = Array.from(
    { length: 24 },
    (_, index) => {
      const store = index % 2 === 0 ? primary : secondary;
      const staff = pick(store.staff, index);
      const pii = prepareCustomerPii(`Analytics Field ${index}`, `9822${String(300000 + index).slice(-6)}`);
      const isMay2025 = index < 8;
      const isMay2026 = index >= 8 && index < 16;

      return {
        storeId: store.id,
        staffId: staff.id,
        activityDate: isMay2025
          ? visitAt(2025, 5, 3 + index, 14)
          : isMay2026
            ? visitAt(2026, 5, 3 + (index - 8), 15)
            : daysAgo(index),
        customerName: pii.name,
        customerPhone: pii.phone,
        customerPhoneHash: pii.phoneHash,
        customerType: pick(CUSTOMER_TYPES, index),
        area: pick(AREAS, index) ?? "Demo locality",
        gender: pick(GENDERS, index),
        ageGroup: pick(AGE_GROUPS, index),
        activityType: "DOOR_TO_DOOR",
        locationLabel: `Society block ${index + 1}`,
        schemesPitched: index % 3 === 0 ? ["GHS"] : ["GPP"],
        enrollmentOutcome: pick(SCHEME_OUTCOMES, index) ?? "INTERESTED",
        monthlyCommitment: index % 2 === 0 ? 5000 : 3000,
        intentTier: pick(INTENT_TIERS, index) ?? "WARM",
        staffNotes: MOCK_TAG,
      };
    },
  );

  await prisma.fieldSale.createMany({ data: fieldSalePayloads });

  console.log("Analytics mock seed complete (local testing only):");
  console.log({
    storesUsed: storesWithStaff.map((store) => store.name),
    visits: visitPayloads.length,
    fieldSales: fieldSalePayloads.length,
    may2025Visits: 70,
    may2026Visits: 90,
    recentVisits: 90,
    mockTag: MOCK_TAG,
    tryCompare: "Analytics → Compare → May 2026 vs May 2025",
    remove: "Delete prisma/seed-analytics-mock.ts and npm run db:seed:analytics when done.",
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
