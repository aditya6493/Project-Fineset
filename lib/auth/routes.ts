import type { AppSession } from "@/types";

export function getRedirectForRole(role: AppSession["role"]): string {
  switch (role) {
    case "STAFF":
      return "/staff/dashboard";
    case "STORE_MANAGER":
      return "/store/dashboard";
    case "MASTER_ADMIN":
      return "/admin/dashboard";
  }
}
