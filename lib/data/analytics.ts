import { cache } from "react";
import { getServerSession, requireRole } from "@/lib/auth/session";
import {
  getAdminDashboardOverview,
  getAdminStoreDetailAnalytics,
  getStoreAnalytics,
} from "@/lib/services/analytics";
import { DEFAULT_ANALYTICS_PARAMS } from "@/lib/query/initial-data";
import type {
  AdminDashboardOverview,
  AnalyticsData,
  GetAnalyticsParams,
  StoreDetailAnalytics,
} from "@/types";

export interface InitialStoreAnalyticsPayload {
  params: GetAnalyticsParams;
  data: AnalyticsData;
}

export interface InitialAdminOverviewPayload {
  params: GetAnalyticsParams;
  data: AdminDashboardOverview;
}

export interface InitialAdminStoreDetailPayload {
  storeId: string;
  params: GetAnalyticsParams;
  data: StoreDetailAnalytics;
}

export const fetchInitialStoreAnalytics = cache(
  async (
    overrides: GetAnalyticsParams = {},
  ): Promise<InitialStoreAnalyticsPayload | null> => {
    const session = await getServerSession();
    if (!requireRole(session, ["STORE_MANAGER"])) return null;

    const params: GetAnalyticsParams = {
      ...DEFAULT_ANALYTICS_PARAMS,
      ...overrides,
    };
    const period = params.period ?? "week";
    const data = await getStoreAnalytics(session.storeId, period);

    return { params: { period }, data };
  },
);

export const fetchInitialAdminOverview = cache(
  async (
    overrides: GetAnalyticsParams = {},
  ): Promise<InitialAdminOverviewPayload | null> => {
    const session = await getServerSession();
    if (!requireRole(session, ["MASTER_ADMIN"])) return null;

    const params: GetAnalyticsParams = {
      ...DEFAULT_ANALYTICS_PARAMS,
      ...overrides,
    };
    const period = params.period ?? "week";
    const data = await getAdminDashboardOverview(period);

    return { params: { period }, data };
  },
);

export const fetchInitialAdminStoreDetail = cache(
  async (
    storeId: string,
    overrides: GetAnalyticsParams = {},
  ): Promise<InitialAdminStoreDetailPayload | null> => {
    const session = await getServerSession();
    if (!requireRole(session, ["MASTER_ADMIN"])) return null;

    const params: GetAnalyticsParams = {
      ...DEFAULT_ANALYTICS_PARAMS,
      ...overrides,
    };
    const period = params.period ?? "week";
    const data = await getAdminStoreDetailAnalytics(storeId, period);

    return { storeId, params: { period }, data };
  },
);
