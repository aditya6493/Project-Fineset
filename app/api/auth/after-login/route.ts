import { NextResponse } from "next/server";
import { syncAuthMetadataForSession } from "@/lib/auth/activate-profile";
import { logAuthEvent } from "@/lib/auth/audit";
import { getAppSessionForAuthUser, touchLastLogin } from "@/lib/auth/get-app-session";
import { createClient } from "@/lib/supabase/server";
import { forbidden, unauthorized } from "@/lib/auth/session";
import {
  checkLoginRateLimit,
  getRequestIdentifier,
} from "@/lib/rate-limit";

function logAfterLogin(event: string, payload: Record<string, unknown>) {
  console.info("[auth.after-login]", JSON.stringify({ event, ...payload }));
}

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

  const session = await getAppSessionForAuthUser(user.id, user.email);
  mark("getAppSessionForAuthUser");
  if (!session) {
    void logAuthEvent({
      event: "LOGIN_FAILED",
      authId: user.id,
      email: user.email,
      metadata: { reason: "inactive_or_missing_profile" },
    });
    logAfterLogin("missing-session", {
      totalMs: Date.now() - startedAt,
      timings,
    });
    return forbidden("Account is not active. Complete your invite or contact an admin.");
  }

  // Non-critical updates: avoid blocking login response.
  void touchLastLogin(session.userId).catch((err) => {
    console.error("[auth.after-login] touchLastLogin failed", session.userId, err);
  });
  void syncAuthMetadataForSession(user.id, session);
  mark("nonBlockingUpdatesScheduled");

  const totalMs = Date.now() - startedAt;
  void logAuthEvent({
    event: "LOGIN_SUCCESS",
    authId: user.id,
    email: user.email,
    metadata: {
      role: session.role,
      latencyMs: totalMs,
    },
  });
  logAfterLogin("success", {
    totalMs,
    role: session.role,
    timings,
  });

  return NextResponse.json({
    role: session.role,
    redirectTo: null,
  });
}
