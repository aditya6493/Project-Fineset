import { NextResponse } from "next/server";
import { activateProfileForAuthUser } from "@/lib/auth/activate-profile";
import { logAuthEvent } from "@/lib/auth/audit";
import { getAppSession } from "@/lib/auth/get-app-session";
import { createClient } from "@/lib/supabase/server";
import { forbidden, unauthorized } from "@/lib/auth/session";
import {
  checkLoginRateLimit,
  getRequestIdentifier,
} from "@/lib/rate-limit";

export async function POST() {
  const identifier = await getRequestIdentifier();
  const rateLimit = await checkLoginRateLimit(identifier);
  if (!rateLimit.success) {
    return NextResponse.json(
      { message: "Too many login attempts. Please try again later." },
      { status: 429 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    await logAuthEvent({ event: "LOGIN_FAILED", metadata: { reason: "no_user" } });
    return unauthorized();
  }

  await activateProfileForAuthUser(user.id, user.email);

  const session = await getAppSession();
  if (!session) {
    await logAuthEvent({
      event: "LOGIN_FAILED",
      authId: user.id,
      email: user.email,
      metadata: { reason: "inactive_or_missing_profile" },
    });
    return forbidden("Account is not active. Complete your invite or contact an admin.");
  }

  await logAuthEvent({
    event: "LOGIN_SUCCESS",
    authId: user.id,
    email: user.email,
    metadata: { role: session.role },
  });

  return NextResponse.json({
    role: session.role,
    redirectTo: null,
  });
}
