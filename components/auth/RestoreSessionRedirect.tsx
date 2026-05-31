"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRedirectForRole } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/client";
import type { AppSession } from "@/types";

function isAppRole(value: unknown): value is AppSession["role"] {
  return value === "STAFF" || value === "STORE_MANAGER" || value === "MASTER_ADMIN";
}

/**
 * If a Supabase session cookie is still valid in the browser, skip the login form.
 */
export function RestoreSessionRedirect() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    void supabase.auth.getSession().then(({ data: { session } }) => {
      const role = session?.user.app_metadata?.role;
      if (session?.user && isAppRole(role)) {
        router.replace(getRedirectForRole(role));
      }
    });
  }, [router]);

  return null;
}
