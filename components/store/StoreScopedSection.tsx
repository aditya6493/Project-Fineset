"use client";

import type { ReactNode } from "react";
import { useStoreDashboard } from "@/components/store/StoreDashboardProvider";
import { SelectStorePrompt } from "@/components/store/SelectStorePrompt";
import type { Content } from "@/content/en";

type StoreContent = Content["store"];

export function StoreScopedSection({
  store,
  children,
}: {
  store: StoreContent;
  children: (storeId: string) => ReactNode;
}) {
  const { storeId, hasMultipleStores, isSingleStoreManager } = useStoreDashboard();

  if (!storeId) {
    if (isSingleStoreManager) {
      return null;
    }
    if (hasMultipleStores) {
      return <SelectStorePrompt store={store} />;
    }
    return null;
  }

  return <>{children(storeId)}</>;
}
