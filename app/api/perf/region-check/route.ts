import { NextResponse } from "next/server";

function host(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const headers = request.headers;
  const vercelId = headers.get("x-vercel-id");
  const edgeRegion = headers.get("x-vercel-edge-region");
  const deployedRegion = headers.get("x-vercel-region");

  return NextResponse.json({
    ok: true,
    runtime: {
      nodeEnv: process.env.NODE_ENV,
      vercelId,
      edgeRegion,
      deployedRegion,
    },
    dependencies: {
      supabaseHost: host(process.env.NEXT_PUBLIC_SUPABASE_URL),
      upstashHost: host(process.env.UPSTASH_REDIS_REST_URL),
      dbHost:
        process.env.DATABASE_URL?.match(/@([^/?]+)(?:\/|\?|$)/)?.[1] ?? null,
    },
    hint: "Keep Vercel runtime, Supabase project region, Upstash region, and DB host region as close as possible to reduce p95 latency.",
  });
}
