"use client";

import { content } from "@/content/en";
import { StoreScopedSection } from "@/components/store/StoreScopedSection";
import { StoreVisitsLog } from "@/components/store/StoreVisitsLog";
import { storeDetailPath } from "@/lib/utils/store-dashboard-url";
import type { GetVisitsParams, PaginatedResponse, VisitListItem } from "@/types";
import type { getStaff } from "@/lib/api/staff";

interface StoreVisitsPageClientProps {
  initialVisits?: PaginatedResponse<VisitListItem>;
  initialVisitsParams?: GetVisitsParams;
  initialStaff?: Awaited<ReturnType<typeof getStaff>>;
  urlStoreId?: string;
}

export function StoreVisitsPageClient({
  initialVisits,
  initialVisitsParams,
  initialStaff,
  urlStoreId,
}: StoreVisitsPageClientProps) {
  const store = content.store;

  return (
    <StoreScopedSection store={store}>
      {(storeId) => (
        <StoreVisitsLog
          store={store}
          storeId={storeId}
          visitFields={content.visitForm.fields}
          common={content.common}
          emptyMessage={content.empty.visits}
          initialVisits={
            urlStoreId === storeId ? initialVisits : undefined
          }
          initialVisitsParams={
            urlStoreId === storeId ? initialVisitsParams : undefined
          }
          initialStaff={urlStoreId === storeId ? initialStaff : undefined}
          backHref={storeDetailPath(storeId)}
          backLabel={store.storeDetail.backToPortfolio}
        />
      )}
    </StoreScopedSection>
  );
}
