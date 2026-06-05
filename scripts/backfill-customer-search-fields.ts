/**
 * Populates nameSearch / customerNameSearch / phoneLast4 from decrypted PII.
 * Run after migration: npm run db:backfill-search
 */
import { prisma } from "@/lib/db/prisma";
import { buildCustomerSearchFields } from "@/lib/services/customer-search";
import { decryptCustomerFields, decryptVisitPii } from "@/lib/services/pii";

const BATCH = 200;

async function backfillCustomers() {
  let cursor: string | undefined;
  let updated = 0;

  for (;;) {
    const rows = await prisma.customer.findMany({
      take: BATCH,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" },
      select: { id: true, name: true, phone: true, nameSearch: true },
    });
    if (rows.length === 0) break;

    for (const row of rows) {
      const decrypted = decryptCustomerFields(row);
      const fields = buildCustomerSearchFields(
        decrypted.name,
        decrypted.phone,
      );
      if (row.nameSearch === fields.customerNameSearch) continue;

      await prisma.customer.update({
        where: { id: row.id },
        data: {
          nameSearch: fields.customerNameSearch,
          phoneLast4: fields.phoneLast4,
        },
      });
      updated += 1;
    }

    cursor = rows[rows.length - 1]?.id;
    if (rows.length < BATCH) break;
  }

  return updated;
}

async function backfillVisits() {
  let cursor: string | undefined;
  let updated = 0;

  for (;;) {
    const rows = await prisma.visit.findMany({
      take: BATCH,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" },
      select: {
        id: true,
        customerName: true,
        customerPhone: true,
        customerNameSearch: true,
      },
    });
    if (rows.length === 0) break;

    for (const row of rows) {
      const decrypted = decryptVisitPii(row);
      const fields = buildCustomerSearchFields(
        decrypted.customerName,
        decrypted.customerPhone,
      );
      if (row.customerNameSearch === fields.customerNameSearch) continue;

      await prisma.visit.update({
        where: { id: row.id },
        data: {
          customerNameSearch: fields.customerNameSearch,
          phoneLast4: fields.phoneLast4,
        },
      });
      updated += 1;
    }

    cursor = rows[rows.length - 1]?.id;
    if (rows.length < BATCH) break;
  }

  return updated;
}

async function backfillFieldSales() {
  let cursor: string | undefined;
  let updated = 0;

  for (;;) {
    const rows = await prisma.fieldSale.findMany({
      take: BATCH,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" },
      select: {
        id: true,
        customerName: true,
        customerPhone: true,
        customerNameSearch: true,
      },
    });
    if (rows.length === 0) break;

    for (const row of rows) {
      const decrypted = decryptVisitPii({
        customerName: row.customerName,
        customerPhone: row.customerPhone,
      });
      const fields = buildCustomerSearchFields(
        decrypted.customerName,
        decrypted.customerPhone,
      );
      if (row.customerNameSearch === fields.customerNameSearch) continue;

      await prisma.fieldSale.update({
        where: { id: row.id },
        data: {
          customerNameSearch: fields.customerNameSearch,
          phoneLast4: fields.phoneLast4,
        },
      });
      updated += 1;
    }

    cursor = rows[rows.length - 1]?.id;
    if (rows.length < BATCH) break;
  }

  return updated;
}

async function main() {
  const [customers, visits, fieldSales] = await Promise.all([
    backfillCustomers(),
    backfillVisits(),
    backfillFieldSales(),
  ]);
  console.log("Backfill complete:", { customers, visits, fieldSales });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
