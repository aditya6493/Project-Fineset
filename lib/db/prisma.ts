import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "";
  if (
    process.env.NODE_ENV === "production" &&
    url.includes("connection_limit=1")
  ) {
    console.warn(
      "[prisma] DATABASE_URL uses connection_limit=1 — increase to at least 5 on Vercel to avoid pool timeouts (P2024).",
    );
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Reuse one client per serverless instance (dev + production).
globalForPrisma.prisma = prisma;
