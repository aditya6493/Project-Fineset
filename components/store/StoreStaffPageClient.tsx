"use client";

import { content } from "@/content/en";
import { StoreScopedSection } from "@/components/store/StoreScopedSection";
import { StaffManagement } from "@/components/store/StaffManagement";
import { storeDetailPath } from "@/lib/utils/store-dashboard-url";
import type { getStaff } from "@/lib/api/staff";

interface StoreStaffPageClientProps {
  initialStaff?: Awaited<ReturnType<typeof getStaff>>;
  urlStoreId?: string;
}

export function StoreStaffPageClient({
  initialStaff,
  urlStoreId,
}: StoreStaffPageClientProps) {
  const store = content.store;

  return (
    <StoreScopedSection store={store}>
      {(storeId) => (
        <StaffManagement
          store={store}
          storeId={storeId}
          emptyMessage={content.empty.staff}
          errors={content.errors}
          initialStaff={urlStoreId === storeId ? initialStaff : undefined}
          backHref={storeDetailPath(storeId)}
          backLabel={store.storeDetail.backToPortfolio}
        />
      )}
    </StoreScopedSection>
  );
}
