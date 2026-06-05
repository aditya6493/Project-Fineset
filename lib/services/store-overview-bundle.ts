import { getStoreAnalytics } from "@/lib/services/analytics";
import { listStoresLinkedToManagerEmail } from "@/lib/services/manager-stores";
import { getStoreCallAnalytics } from "@/lib/services/store-call-analytics";
import { getStoreFieldSaleAnalytics } from "@/lib/services/store-field-sale-analytics";
import { getStoreRsoPerformance } from "@/lib/services/rso-performance";
import type {
  AnalyticsData,
  AnalyticsPeriod,
  MyStoresResponse,
  StoreCallAnalytics,
  StoreFieldSaleAnalytics,
  StoreRsoPerformance,
} from "@/types";

export interface StoreOverviewBundle {
  myStores: MyStoresResponse;
  kpis: AnalyticsData;
  calls: StoreCallAnalytics;
  fieldSales: StoreFieldSaleAnalytics;
  rsoPerformance: StoreRsoPerformance;
}

export async function getStoreOverviewBundle(
  email: string,
  primaryStoreId: string,
  storeId: string,
  period: AnalyticsPeriod["label"],
): Promise<StoreOverviewBundle> {
  const [stores, kpis, calls, fieldSales, rsoPerformance] = await Promise.all([
    listStoresLinkedToManagerEmail(email, primaryStoreId),
    getStoreAnalytics(storeId, period),
    getStoreCallAnalytics(storeId, period),
    getStoreFieldSaleAnalytics(storeId, period),
    getStoreRsoPerformance(storeId, period),
  ]);

  return {
    myStores: {
      data: stores,
      selectedStoreId: storeId,
    },
    kpis,
    calls,
    fieldSales,
    rsoPerformance,
  };
}
