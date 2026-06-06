import { PrismaClient } from "@prisma/client";

const ensuredKey = Symbol.for("fineset.customerSchemaEnsured");

type GlobalEnsured = typeof globalThis & {
  [ensuredKey]?: boolean;
};

/**
 * Idempotent Customer / Visit profile DDL for environments that cannot run migrate deploy.
 */
export async function ensureProductionCustomerSchema(): Promise<void> {
  const g = globalThis as GlobalEnsured;
  if (g[ensuredKey]) return;

  const migrationUrl =
    process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (!migrationUrl) {
    console.warn("[ensureProductionCustomerSchema] No DIRECT_URL or DATABASE_URL");
    return;
  }

  const client = new PrismaClient({
    datasources: { db: { url: migrationUrl } },
  });

  try {
    await client.$executeRaw`
      ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP(3)
    `;
    await client.$executeRaw`
      ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "address" TEXT
    `;
    await client.$executeRaw`
      ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "anniversary" TIMESTAMP(3)
    `;
    await client.$executeRaw`
      ALTER TABLE "Visit" ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP(3)
    `;
    await client.$executeRaw`
      ALTER TABLE "Visit" ADD COLUMN IF NOT EXISTS "address" TEXT
    `;
    await client.$executeRaw`
      ALTER TABLE "Visit" ADD COLUMN IF NOT EXISTS "profession" TEXT
    `;
    await client.$executeRaw`
      ALTER TABLE "Visit" ADD COLUMN IF NOT EXISTS "anniversary" TIMESTAMP(3)
    `;

    g[ensuredKey] = true;
    console.info("[ensureProductionCustomerSchema] Customer schema ensured");
  } catch (err) {
    console.error("[ensureProductionCustomerSchema] failed", err);
    throw err;
  } finally {
    await client.$disconnect();
  }
}
