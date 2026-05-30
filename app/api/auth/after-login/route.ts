import { NextResponse } from "next/server";
import { completeLoginForSupabaseUser, logLoginSuccess } from "@/lib/auth/complete-login";
import { logAuthEvent } from "@/lib/auth/audit";
import { createClient } from "@/lib/supabase/server";
import { forbidden, unauthorized } from "@/lib/auth/session";
import {
  checkLoginRateLimit,
  getRequestIdentifier,
} from "@/lib/rate-limit";

function logAfterLogin(event: string, payload: Record<string, unknown>) {
  console.info("[auth.after-login]", JSON.stringify({ event, ...payload }));
}

/** @deprecated Prefer signInAction — kept for backward compatibility. */
export async function POST() {
  const startedAt = Date.now();
  let lastMark = startedAt;
  const timings: Record<string, number> = {};
  const mark = (label: string) => {
    const now = Date.now();
    timings[label] = now - lastMark;
    lastMark = now;
  };

  const identifier = await getRequestIdentifier();
  mark("getRequestIdentifier");
  const rateLimit = await checkLoginRateLimit(identifier);
  mark("checkLoginRateLimit");
  if (!rateLimit.success) {
    logAfterLogin("throttled", {
      totalMs: Date.now() - startedAt,
      timings,
    });
    return NextResponse.json(
      { message: "Too many login attempts. Please try again later." },
      { status: 429 },
    );
  }

  const supabase = await createClient();
  mark("createClient");
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  mark("supabaseGetUser");

  if (error || !user?.email) {
    void logAuthEvent({ event: "LOGIN_FAILED", metadata: { reason: "no_user" } });
    logAfterLogin("unauthorized", {
      totalMs: Date.now() - startedAt,
      timings,
    });
    return unauthorized();
  }

  const result = await completeLoginForSupabaseUser(user);
  mark("completeLogin");

  if (!result.ok) {
    logAfterLogin("missing-session", {
      totalMs: Date.now() - startedAt,
      timings,
    });
    return forbidden("Account is not active. Complete your invite or contact an admin.");
  }

  const totalMs = Date.now() - startedAt;
  await logLoginSuccess(user, result.session, totalMs);
  logAfterLogin("success", {
    totalMs,
    role: result.session.role,
    timings,
  });

  return NextResponse.json({
    role: result.session.role,
    redirectTo: null,
  });
}
