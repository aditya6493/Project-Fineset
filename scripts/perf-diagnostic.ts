/**
 * Measure Supabase auth + Postgres round-trip latency from your machine.
 *
 * Usage:
 *   npm run perf:diagnostic
 */
import { config as loadDotenv } from "dotenv";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

loadDotenv({ path: resolve(process.cwd(), ".env.local") });

function hostFromUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).host;
  } catch {
    return value.match(/@([^/?]+)/)?.[1] ?? null;
  }
}

async function timeMs<T>(fn: () => Promise<T>): Promise<{ ms: number; result: T }> {
  const start = Date.now();
  const result = await fn();
  return { ms: Date.now() - start, result };
}

async function main(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL?.trim();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  console.log("FineSet performance diagnostic");
  console.log("------------------------------");
  console.log("Supabase host:", hostFromUrl(supabaseUrl) ?? "(missing)");
  console.log("DB host:", hostFromUrl(dbUrl) ?? "(missing)");
  console.log(
    "Vercel target region (vercel.json): iad1 — align Supabase + Upstash to US East when possible.",
  );
  console.log(
    "Remote DB from far away often adds 1–3s per query in dev; use same region or DEV_AUTH_BYPASS for UI work.\n",
  );

  if (!dbUrl) {
    console.warn("DATABASE_URL not set — skipping DB ping.");
  } else {
    const prisma = new PrismaClient();
    try {
      const ping = await timeMs(() => prisma.$queryRaw`SELECT 1`);
      console.log(`DB SELECT 1: ${ping.ms}ms`);

      const visitCount = await timeMs(() => prisma.visit.count());
      console.log(`DB visit.count: ${visitCount.ms}ms`);
    } finally {
      await prisma.$disconnect();
    }
  }

  if (!supabaseUrl || !anonKey) {
    console.warn("Supabase env missing — skipping auth ping.");
    return;
  }

  const supabase = createClient(supabaseUrl, anonKey);
  const authPing = await timeMs(() => supabase.auth.getSession());
  console.log(`Supabase getSession (anon): ${authPing.ms}ms`);

  console.log("\nTargets (same region as production):");
  console.log("  DB SELECT 1: < 100ms from Vercel iad1");
  console.log("  getUser (authenticated): < 200ms");
  console.log("\nAlso hit GET /api/perf/region-check when the app is running.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
