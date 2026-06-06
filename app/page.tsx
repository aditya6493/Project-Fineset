import { cookies } from "next/headers";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { getAppSession } from "@/lib/auth/get-app-session";
import {
  isPasswordRecoveryFlowPending,
  PASSWORD_RECOVERY_PATH,
} from "@/lib/auth/password-recovery";
import { getRedirectForRole } from "@/lib/auth/routes";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const cookieStore = await cookies();
  if (isPasswordRecoveryFlowPending(cookieStore)) {
    redirect(PASSWORD_RECOVERY_PATH);
  }

  const session = await getAppSession();
  if (session) {
    redirect(getRedirectForRole(session.role));
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-primary px-page-x py-12">
      <LoginScreen showLogo />
    </main>
  );
}
