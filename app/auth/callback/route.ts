import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { activateProfileForAuthUser } from "@/lib/auth/activate-profile";
import { getRedirectForRole } from "@/lib/auth/routes";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  await activateProfileForAuthUser(user.id, user.email);

  const profile = await prisma.appUser.findUnique({
    where: { authId: user.id },
    select: { role: true, isActive: true },
  });

  if (!profile?.isActive) {
    return NextResponse.redirect(`${origin}/login?error=account_inactive`);
  }

  const destination =
    next && next.startsWith("/") ? next : getRedirectForRole(profile.role);

  return NextResponse.redirect(`${origin}${destination}`);
}
