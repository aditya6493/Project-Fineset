import type { StoreKPIs } from "@/types";

export function isStoreKPIs(kpis: unknown): kpis is StoreKPIs {
  return (
    typeof kpis === "object" &&
    kpis !== null &&
    "openFollowUps" in kpis &&
    "avgTransaction" in kpis
  );
}
