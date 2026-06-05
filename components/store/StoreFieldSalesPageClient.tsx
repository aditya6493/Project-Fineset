"use client";

import { content } from "@/content/en";
import { PortalFieldSalesLog } from "@/components/portal/PortalFieldSalesLog";
import { StoreScopedSection } from "@/components/store/StoreScopedSection";
import { storeDetailPath } from "@/lib/utils/store-dashboard-url";
import type { FieldSaleListResponse, GetFieldSalesListParams } from "@/types";

interface StoreFieldSalesPageClientProps {
  urlStoreId?: string;
  initialFieldSales?: FieldSaleListResponse;
  initialFieldSalesParams?: GetFieldSalesListParams;
}

export function StoreFieldSalesPageClient({
  urlStoreId,
  initialFieldSales,
  initialFieldSalesParams,
}: StoreFieldSalesPageClientProps) {
  const store = content.store;

  return (
    <StoreScopedSection store={store}>
      {(activeStoreId) => (
        <PortalFieldSalesLog
          copy={content.portal.fieldSales}
          common={content.common}
          emptyMessage={content.empty.fieldSales}
          allStoresLabel={content.portal.allStores}
          allStaffLabel={content.portal.allStaff}
          initialStoreId={activeStoreId}
          initialFieldSales={
            urlStoreId === activeStoreId ? initialFieldSales : undefined
          }
          initialFieldSalesParams={
            urlStoreId === activeStoreId ? initialFieldSalesParams : undefined
          }
          backHref={storeDetailPath(activeStoreId)}
          backLabel={store.storeDetail.backToPortfolio}
        />
      )}
    </StoreScopedSection>
  );
}
