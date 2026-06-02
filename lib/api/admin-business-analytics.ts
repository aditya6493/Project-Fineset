import { apiFetch } from "@/lib/api/client";
import type { AnalyticsAskBody } from "@/lib/validations/admin-business-analytics-ask.schema";
import type { AdminBusinessAnalyticsAskResult } from "@/types/admin-business-analytics-ask";

export async function postAdminBusinessAnalyticsAsk(
  body: AnalyticsAskBody,
): Promise<AdminBusinessAnalyticsAskResult> {
  return apiFetch<AdminBusinessAnalyticsAskResult>(
    "/api/analytics/admin/business/ask",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}
