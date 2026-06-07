"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PASSWORD_RECOVERY_PATH } from "@/lib/auth/password-recovery";
import { getRedirectForRole } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/client";
import { isInvalidRefreshTokenError } from "@/lib/supabase/auth-errors";
import { isSupabaseAuthDisabled } from "@/lib/supabase/env";
import type { AppSession } from "@/types";

function isAppRole(value: unknown): value is AppSession["role"] {
  return value === "STAFF" || value === "STORE_MANAGER" || value === "BUSINESS_OWNER" || value === "MASTER_ADMIN";
}

/**
 * If a Supabase session cookie is still valid in the browser, skip the login form.
 */
export function RestoreSessionRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (isSupabaseAuthDisabled()) return;

    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        router.replace(PASSWORD_RECOVERY_PATH);
      }
    });

    void supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error) {
        if (isInvalidRefreshTokenError(error)) {
          void supabase.auth.signOut();
        }
        return;
      }
      const role = user?.app_metadata?.role;
      if (user && isAppRole(role)) {
        router.replace(getRedirectForRole(role));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
