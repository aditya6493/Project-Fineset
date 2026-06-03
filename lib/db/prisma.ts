import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "";
  const directUrl = process.env.DIRECT_URL ?? "";
  if (
    process.env.NODE_ENV === "production" &&
    url.includes("connection_limit=1")
  ) {
    console.warn(
      "[prisma] DATABASE_URL uses connection_limit=1 — increase to at least 5 on Vercel to avoid pool timeouts (P2024).",
    );
  }
  if (process.env.NODE_ENV === "production" && !url.includes("pgbouncer=true")) {
    console.warn(
      "[prisma] DATABASE_URL should include pgbouncer=true for Supabase pooler runtime traffic.",
    );
  }
  if (
    process.env.NODE_ENV === "production" &&
    url.length > 0 &&
    !url.includes(".pooler.supabase.com:6543")
  ) {
    console.warn(
      "[prisma] DATABASE_URL does not look like a Supabase pooler URL (:6543). Verify Vercel runtime DB URL.",
    );
  }
  if (
    process.env.NODE_ENV === "production" &&
    directUrl.length > 0 &&
    !directUrl.includes(":5432")
  ) {
    console.warn(
      "[prisma] DIRECT_URL should use port :5432 (Supabase session pooler or db.*.supabase.co) for local migrations.",
    );
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Reuse one client per serverless instance (dev + production).
globalForPrisma.prisma = prisma;
