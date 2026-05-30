import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { activateProfileForAuthUser } from "@/lib/auth/activate-profile";
import { appSessionFromProfile } from "@/lib/auth/get-app-session";
import { getRedirectForRole } from "@/lib/auth/routes";

function logCallback(event: string, payload: Record<string, unknown>) {
  console.info("[auth.callback]", JSON.stringify({ event, ...payload }));
}

export async function GET(request: Request) {
  const startedAt = Date.now();
  const timings: Record<string, number> = {};
  let lastMark = startedAt;
  const mark = (label: string) => {
    const now = Date.now();
    timings[label] = now - lastMark;
    lastMark = now;
  };

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  const supabase = await createClient();
  mark("createClient");

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  mark("exchangeCodeForSession");

  if (error || !data.user?.email) {
    logCallback("exchange_failed", {
      totalMs: Date.now() - startedAt,
      timings,
    });
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  const user = data.user;

  const profile = await activateProfileForAuthUser(user.id, user.email, {
    awaitMetadataSync: true,
  });
  mark("activateProfile");

  if (!profile?.isActive) {
    logCallback("inactive", { totalMs: Date.now() - startedAt, timings });
    return NextResponse.redirect(`${origin}/login?error=account_inactive`);
  }

  let role = profile.role;
  try {
    const session = appSessionFromProfile(profile, user.email);
    role = session.role;
  } catch (err) {
    console.error("[auth.callback] invalid profile", profile.id, err);
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  const destination =
    next && next.startsWith("/") ? next : getRedirectForRole(role);

  logCallback("success", {
    totalMs: Date.now() - startedAt,
    role,
    timings,
  });

  return NextResponse.redirect(`${origin}${destination}`);
}
