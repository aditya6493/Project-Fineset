import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";

function host(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

async function measureMs<T>(fn: () => Promise<T>): Promise<{ ms: number; ok: boolean; error?: string }> {
  const start = Date.now();
  try {
    await fn();
    return { ms: Date.now() - start, ok: true };
  } catch (error) {
    return {
      ms: Date.now() - start,
      ok: false,
      error: error instanceof Error ? error.message.slice(0, 200) : "unknown",
    };
  }
}

export async function GET(request: Request) {
  const headers = request.headers;
  const vercelId = headers.get("x-vercel-id");
  const edgeRegion = headers.get("x-vercel-edge-region");
  const deployedRegion = headers.get("x-vercel-region");

  const dbPing = await measureMs(() => prisma.$queryRaw`SELECT 1`);

  let authGetUser: { ms: number; ok: boolean; authenticated: boolean; error?: string } = {
    ms: 0,
    ok: true,
    authenticated: false,
  };

  try {
    const supabase = await createClient();
    const authStart = Date.now();
    const { data: { user }, error } = await supabase.auth.getUser();
    authGetUser = {
      ms: Date.now() - authStart,
      ok: !error,
      authenticated: Boolean(user),
      error: error?.message,
    };
  } catch (error) {
    authGetUser = {
      ms: 0,
      ok: false,
      authenticated: false,
      error: error instanceof Error ? error.message.slice(0, 200) : "unknown",
    };
  }

  const targets = {
    dbSelect1Ms: 100,
    authGetUserMs: 200,
  };

  return NextResponse.json({
    ok: dbPing.ok,
    runtime: {
      nodeEnv: process.env.NODE_ENV,
      vercelId,
      edgeRegion,
      deployedRegion,
      vercelConfigRegion: "iad1",
    },
    dependencies: {
      supabaseHost: host(process.env.NEXT_PUBLIC_SUPABASE_URL),
      upstashHost: host(process.env.UPSTASH_REDIS_REST_URL),
      dbHost:
        process.env.DATABASE_URL?.match(/@([^/?]+)(?:\/|\?|$)/)?.[1] ?? null,
      poolerConfigured: process.env.DATABASE_URL?.includes("pgbouncer=true") ?? false,
    },
    timings: {
      dbSelect1: dbPing,
      authGetUser,
    },
    targets,
    withinTargets: {
      dbSelect1: dbPing.ok && dbPing.ms <= targets.dbSelect1Ms,
      authGetUser: authGetUser.ok && authGetUser.ms <= targets.authGetUserMs,
    },
    hint: "Keep Vercel (iad1), Supabase project, Upstash, and DB pooler in the same region. Run npm run perf:diagnostic locally.",
  });
}
