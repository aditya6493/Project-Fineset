import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logAuthEvent } from "@/lib/auth/audit";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.auth.signOut();

  if (user?.email) {
    await logAuthEvent({
      event: "LOGOUT",
      authId: user.id,
      email: user.email,
    });
  }

  return NextResponse.json({ success: true });
}
