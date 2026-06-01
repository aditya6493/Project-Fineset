import { cache } from "react";
import { getServerSession, requireRole } from "@/lib/auth/session";
import {
  getAdminBusinessAnalytics,
  getAdminBusinessAnalyticsFilterOptions,
} from "@/lib/services/admin-business-analytics";
import type { AdminBusinessAnalyticsQuery } from "@/lib/validations/admin-business-analytics.schema";
import type {
  AdminBusinessAnalytics,
  AdminBusinessAnalyticsFilterOptions,
} from "@/types/admin-business-analytics";

export interface InitialAdminBusinessAnalyticsPayload {
  params: AdminBusinessAnalyticsQuery;
  filters: AdminBusinessAnalyticsFilterOptions;
  data: AdminBusinessAnalytics;
}

export const fetchInitialAdminBusinessAnalytics = cache(
  async (): Promise<InitialAdminBusinessAnalyticsPayload | null> => {
    const session = await getServerSession();
    if (!requireRole(session, ["MASTER_ADMIN"])) return null;

    const params: AdminBusinessAnalyticsQuery = {
      period: "month",
      segment: "ALL",
      valueTier: "ALL",
      activeFilters: [],
    };

    const [filters, data] = await Promise.all([
      getAdminBusinessAnalyticsFilterOptions(),
      getAdminBusinessAnalytics(params),
    ]);

    return { params, filters, data };
  },
);
