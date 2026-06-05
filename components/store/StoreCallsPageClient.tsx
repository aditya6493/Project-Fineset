"use client";

import { content } from "@/content/en";
import { PortalCallsLog } from "@/components/portal/PortalCallsLog";
import { StoreScopedSection } from "@/components/store/StoreScopedSection";
import { storeDetailPath } from "@/lib/utils/store-dashboard-url";
import type { GetPortalCallsParams, PortalCallListResponse } from "@/types";

interface StoreCallsPageClientProps {
  urlStoreId?: string;
  initialPortalCalls?: PortalCallListResponse;
  initialPortalCallsParams?: GetPortalCallsParams;
}

export function StoreCallsPageClient({
  urlStoreId,
  initialPortalCalls,
  initialPortalCallsParams,
}: StoreCallsPageClientProps) {
  const store = content.store;

  return (
    <StoreScopedSection store={store}>
      {(activeStoreId) => (
        <PortalCallsLog
          copy={content.portal.calls}
          common={content.common}
          emptyMessage={content.empty.portalCalls}
          allStoresLabel={content.portal.allStores}
          allStaffLabel={content.portal.allStaff}
          initialStoreId={activeStoreId}
          initialPortalCalls={
            urlStoreId === activeStoreId ? initialPortalCalls : undefined
          }
          initialPortalCallsParams={
            urlStoreId === activeStoreId ? initialPortalCallsParams : undefined
          }
          backHref={storeDetailPath(activeStoreId)}
          backLabel={store.storeDetail.backToPortfolio}
        />
      )}
    </StoreScopedSection>
  );
}
