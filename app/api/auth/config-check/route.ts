import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * Safe production debug — no secrets returned. Remove or protect if desired later.
 * GET /api/auth/config-check
 */
export async function GET() {
  const dbUrl = process.env.DATABASE_URL ?? "";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  let dbOk = false;
  let dbError: string | null = null;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch (err) {
    dbError = err instanceof Error ? err.message : "Database connection failed";
  }

  // Broken URLs look like: postgres:Fineset@2026@db... (two @ before host)
  const dbUrlLikelyBroken =
    dbUrl.length > 0 &&
    /^postgres(ql)?:\/\/[^:]+:[^@]+@[^@]+@/.test(dbUrl);

  let supabaseHost = "";
  try {
    supabaseHost = new URL(supabaseUrl).hostname;
  } catch {
    supabaseHost = "(invalid URL)";
  }

  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());

  return NextResponse.json({
    ok:
      dbOk &&
      !dbUrlLikelyBroken &&
      Boolean(supabaseUrl) &&
      hasServiceRole,
    checks: {
      hasDatabaseUrl: dbUrl.length > 0,
      databaseUrlLikelyBroken: dbUrlLikelyBroken,
      databaseConnected: dbOk,
      databaseError: dbError,
      hasSupabaseUrl: supabaseUrl.length > 0,
      supabaseHost,
      hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()),
      hasServiceRoleKey: hasServiceRole,
      staffCreateNeedsServiceRole:
        "POST /api/staff requires SUPABASE_SERVICE_ROLE_KEY to create login users",
      appUrl: process.env.NEXT_PUBLIC_APP_URL?.trim() ?? "(not set)",
      nodeEnv: process.env.NODE_ENV,
    },
    hint: dbUrlLikelyBroken
      ? "DATABASE_URL password contains @ — encode as %40 in Vercel env vars."
      : !dbOk
        ? "Database unreachable — fix DATABASE_URL on Vercel and redeploy."
        : !supabaseUrl
          ? "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY on Vercel, then redeploy."
          : !hasServiceRole
            ? "Add SUPABASE_SERVICE_ROLE_KEY on Vercel — required for Add Staff (Supabase Auth)."
            : "Env looks OK — if Add Staff still fails, open Vercel logs for [api.staff] create failed.",
  });
}
