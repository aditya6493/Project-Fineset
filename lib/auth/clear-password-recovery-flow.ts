"use server";

import { cookies } from "next/headers";
import { PASSWORD_RECOVERY_FLOW_COOKIE } from "@/lib/auth/password-recovery";

export async function clearPasswordRecoveryFlowAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(PASSWORD_RECOVERY_FLOW_COOKIE);
}
