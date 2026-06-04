import { cache } from "react";
import { getServerSession, requireRole } from "@/lib/auth/session";
import { resolveManagerStoreId } from "@/lib/services/manager-stores";
import {
  getAdminDashboardOverview,
  getAdminStoreDetailAnalytics,
  getStoreAnalytics,
} from "@/lib/services/analytics";
import {
  getStoreOverviewBundle,
  type StoreOverviewBundle,
} from "@/lib/services/store-overview-bundle";
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

export interface InitialStoreOverviewBundlePayload {
  params: GetAnalyticsParams;
  bundle: StoreOverviewBundle;
}

export const fetchInitialStoreAnalytics = cache(
  async (
    overrides: GetAnalyticsParams = {},
  ): Promise<InitialStoreAnalyticsPayload | null> => {
    const startedAt = Date.now();
    const session = await getServerSession();
    if (!requireRole(session, ["STORE_MANAGER"])) return null;

    const params: GetAnalyticsParams = {
      ...DEFAULT_ANALYTICS_PARAMS,
      ...overrides,
    };
    const period = params.period ?? "week";
    const storeId = await resolveManagerStoreId(
      session.email,
      session.storeId,
      params.storeId,
    );
    try {
      const data = await getStoreAnalytics(storeId, period);

      return { params: { period, storeId }, data };
    } catch (error) {
      console.error("[data.analytics] fetchInitialStoreAnalytics failed", {
        period,
        storeId: session.storeId,
        elapsedMs: Date.now() - startedAt,
        error,
      });
      return null;
    }
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
    try {
      const data = await getAdminDashboardOverview(period);
      return { params: { period }, data };
    } catch (error) {
      console.error("[data.analytics] fetchInitialAdminOverview failed", {
        period,
        error,
      });
      return null;
    }
  },
);

export const fetchInitialStoreOverviewBundle = cache(
  async (
    overrides: GetAnalyticsParams = {},
  ): Promise<InitialStoreOverviewBundlePayload | null> => {
    const startedAt = Date.now();
    const session = await getServerSession();
    if (!requireRole(session, ["STORE_MANAGER"])) return null;

    const params: GetAnalyticsParams = {
      ...DEFAULT_ANALYTICS_PARAMS,
      ...overrides,
    };
    const period = params.period ?? "week";
    const storeId = await resolveManagerStoreId(
      session.email,
      session.storeId,
      params.storeId,
    );

    try {
      const bundle = await getStoreOverviewBundle(
        session.email,
        session.storeId,
        storeId,
        period,
      );
      return { params: { period, storeId }, bundle };
    } catch (error) {
      console.error("[data.analytics] fetchInitialStoreOverviewBundle failed", {
        period,
        storeId,
        elapsedMs: Date.now() - startedAt,
        error,
      });
      return null;
    }
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
