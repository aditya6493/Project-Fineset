import type { AdminKPIs, StoreKPIs } from "@/types";

export function isStoreKPIs(kpis: StoreKPIs | AdminKPIs): kpis is StoreKPIs {
  return "openFollowUps" in kpis;
}

export function isAdminKPIs(kpis: StoreKPIs | AdminKPIs): kpis is AdminKPIs {
  return "activeStores" in kpis;
}
