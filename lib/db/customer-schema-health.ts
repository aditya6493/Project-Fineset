import { prisma } from "@/lib/db/prisma";

const REQUIRED_CUSTOMER_COLUMNS = [
  "dateOfBirth",
  "address",
  "anniversary",
] as const;

const REQUIRED_VISIT_COLUMNS = [
  "dateOfBirth",
  "address",
  "profession",
  "anniversary",
] as const;

export type CustomerSchemaHealth = {
  missingCustomerColumns: string[];
  missingVisitColumns: string[];
  prismaCustomerQueryOk: boolean;
  prismaCustomerQueryError: string | null;
};

async function missingColumns(
  tableName: "Customer" | "Visit",
  required: readonly string[],
): Promise<string[]> {
  const rows = await prisma.$queryRaw<Array<{ column_name: string }>>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = ${tableName}
  `;
  const present = new Set(rows.map((row) => row.column_name));
  return required.filter((column) => !present.has(column));
}

export async function getCustomerSchemaHealth(): Promise<CustomerSchemaHealth> {
  const [missingCustomerColumns, missingVisitColumns] = await Promise.all([
    missingColumns("Customer", REQUIRED_CUSTOMER_COLUMNS),
    missingColumns("Visit", REQUIRED_VISIT_COLUMNS),
  ]);

  let prismaCustomerQueryOk = false;
  let prismaCustomerQueryError: string | null = null;
  try {
    await prisma.customer.findFirst({
      select: {
        id: true,
        dateOfBirth: true,
        address: true,
        profession: true,
        anniversary: true,
      },
    });
    prismaCustomerQueryOk = true;
  } catch (err) {
    prismaCustomerQueryError =
      err instanceof Error ? err.message.slice(0, 400) : "Prisma customer query failed";
  }

  return {
    missingCustomerColumns,
    missingVisitColumns,
    prismaCustomerQueryOk,
    prismaCustomerQueryError,
  };
}

export async function isCustomerSchemaReady(): Promise<boolean> {
  const health = await getCustomerSchemaHealth();
  return (
    health.missingCustomerColumns.length === 0 &&
    health.missingVisitColumns.length === 0 &&
    health.prismaCustomerQueryOk
  );
}
