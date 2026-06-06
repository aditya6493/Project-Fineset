import { prisma } from "@/lib/db/prisma";

const REQUIRED_STORE_COLUMNS = [
  "pincode",
  "businessOwnerName",
  "businessOwnerEmail",
  "customCategory",
] as const;

export type StoreSchemaHealth = {
  missingStoreColumns: string[];
  storeCategoryOptionTableExists: boolean;
  storeRowCount: number;
  prismaStoreQueryOk: boolean;
  prismaStoreQueryError: string | null;
};

export async function getMissingStoreColumns(): Promise<string[]> {
  const rows = await prisma.$queryRaw<Array<{ column_name: string }>>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Store'
  `;
  const present = new Set(rows.map((row) => row.column_name));
  return REQUIRED_STORE_COLUMNS.filter((column) => !present.has(column));
}

async function storeCategoryOptionTableExists(): Promise<boolean> {
  const rows = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'StoreCategoryOption'
    ) AS exists
  `;
  return Boolean(rows[0]?.exists);
}

export async function getStoreSchemaHealth(): Promise<StoreSchemaHealth> {
  const missingStoreColumns = await getMissingStoreColumns();
  const tableExists = await storeCategoryOptionTableExists();

  let storeRowCount = 0;
  try {
    const count = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count FROM "Store"
    `;
    storeRowCount = Number(count[0]?.count ?? 0);
  } catch {
    storeRowCount = -1;
  }

  let prismaStoreQueryOk = false;
  let prismaStoreQueryError: string | null = null;
  try {
    await prisma.store.findFirst({ select: { id: true } });
    prismaStoreQueryOk = true;
  } catch (err) {
    prismaStoreQueryError =
      err instanceof Error ? err.message.slice(0, 400) : "Prisma store query failed";
  }

  return {
    missingStoreColumns,
    storeCategoryOptionTableExists: tableExists,
    storeRowCount,
    prismaStoreQueryOk,
    prismaStoreQueryError,
  };
}

export async function isStoreSchemaReady(): Promise<boolean> {
  const health = await getStoreSchemaHealth();
  return (
    health.missingStoreColumns.length === 0 &&
    health.storeCategoryOptionTableExists &&
    health.prismaStoreQueryOk
  );
}
