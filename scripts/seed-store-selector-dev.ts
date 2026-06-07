/**
 * Local dev dummy data for the store dashboard store selector.
 *
 * Links multiple active stores to manager@store-alpha.local so the Overview
 * dropdown shows more than one option.
 *
 * Usage: npm run db:seed:store-selector
 * Prereq: npm run db:seed && npm run auth:bootstrap-dev (for AppUser login)
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MANAGER_EMAIL = "manager@store-alpha.local";

const DEV_STORES = [
  {
    name: "Store Alpha",
    category: "JEWELRY" as const,
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500032",
  },
  {
    name: "Store Beta",
    category: "HANDBAGS" as const,
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
  },
  {
    name: "Store Gamma",
    category: "WATCHES" as const,
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600001",
  },
  {
    name: "Store Delta",
    category: "OTHER" as const,
    customCategory: "Luxury Accessories",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
  },
];

async function upsertDevStore(spec: (typeof DEV_STORES)[number]) {
  const existing = await prisma.store.findFirst({
    where: { name: { equals: spec.name, mode: "insensitive" } },
  });

  const data = {
    name: spec.name,
    category: spec.category,
    customCategory: "customCategory" in spec ? spec.customCategory : null,
    city: spec.city,
    state: spec.state,
    pincode: spec.pincode,
    businessOwnerName: "Dev Manager",
    businessOwnerEmail: MANAGER_EMAIL,
    isActive: true,
  };

  if (existing) {
    return prisma.store.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.store.create({ data });
}

async function ensureStaffForStore(storeId: string, storeName: string) {
  const suffix = storeName.replace(/\s+/g, "").toLowerCase();
  const employeeId = `EMP-${suffix.slice(0, 8).toUpperCase()}`;

  const existing = await prisma.staff.findUnique({ where: { employeeId } });
  if (existing) return existing;

  return prisma.staff.create({
    data: {
      name: `${storeName} Staff`,
      employeeId,
      storeId,
      role: "STAFF",
      isActive: true,
    },
  });
}

async function main() {
  console.log(`Seeding store-selector dev data for ${MANAGER_EMAIL}...\n`);

  const upserted = [];
  for (const spec of DEV_STORES) {
    const store = await upsertDevStore(spec);
    await ensureStaffForStore(store.id, store.name);
    upserted.push(store);
    console.log(
      `✓ ${store.name} (${store.city}) — ${store.businessOwnerEmail ?? "no email"}`,
    );
  }

  const manager = await prisma.appUser.findUnique({
    where: { email: MANAGER_EMAIL },
  });
  if (manager && !manager.storeId) {
    const alpha = upserted.find((s) => s.name === "Store Alpha");
    if (alpha) {
      await prisma.appUser.update({
        where: { id: manager.id },
        data: { storeId: alpha.id },
      });
      console.log(`✓ Linked AppUser profile to Store Alpha`);
    }
  }

  console.log("\nDone. Sign in as manager@store-alpha.local and open /business-owner/dashboard.");
  console.log("You should see a store dropdown with", upserted.length, "stores.");
  console.log("Dev password (after auth:bootstrap-dev): FineSet#1dev");
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
