import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth/get-app-session";
import { getRedirectForRole } from "@/lib/auth/routes";
import type { AppSession, UserRole } from "@/types";

export async function requirePortalSession(
  allowed: UserRole | readonly UserRole[],
): Promise<AppSession> {
  const roles = Array.isArray(allowed) ? allowed : [allowed];
  const session = await getAppSession();

  if (!session) {
    redirect("/login");
  }

  if (!roles.includes(session.role)) {
    redirect(getRedirectForRole(session.role));
  }

  return session;
}
