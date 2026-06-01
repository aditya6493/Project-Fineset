import { apiFetch, buildQueryString } from "@/lib/api/client";
import type { AdminBusinessAnalyticsQuery } from "@/lib/validations/admin-business-analytics.schema";
import type {
  AdminBusinessAnalytics,
  AdminBusinessAnalyticsFilterOptions,
} from "@/types/admin-business-analytics";

function serializeAnalyticsQuery(params: AdminBusinessAnalyticsQuery): Record<string, string> {
  const output: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (key === "activeFilters" && Array.isArray(value)) {
      if (value.length > 0) output.activeFilters = value.join(",");
      continue;
    }
    if (value instanceof Date) {
      output[key] = value.toISOString().slice(0, 10);
      continue;
    }
    if (typeof value === "boolean") {
      output[key] = value ? "true" : "false";
      continue;
    }
    output[key] = String(value);
  }

  return output;
}

export async function getAdminBusinessAnalyticsFilterOptions(): Promise<AdminBusinessAnalyticsFilterOptions> {
  return apiFetch<AdminBusinessAnalyticsFilterOptions>(
    "/api/analytics/admin/business/filters",
  );
}

export async function getAdminBusinessAnalytics(
  params: AdminBusinessAnalyticsQuery,
): Promise<AdminBusinessAnalytics> {
  const qs = buildQueryString(serializeAnalyticsQuery(params));
  return apiFetch<AdminBusinessAnalytics>(`/api/analytics/admin/business${qs}`);
}
