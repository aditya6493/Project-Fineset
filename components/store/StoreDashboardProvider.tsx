"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  parseStoreIdFromPath,
  SELECTED_STORE_STORAGE_KEY,
} from "@/lib/utils/store-dashboard-url";
import { useMyStores } from "@/hooks/useMyStores";

interface StoreDashboardContextValue {
  storeId: string | null;
  setStoreId: (id: string) => void;
  hasMultipleStores: boolean;
}

const StoreDashboardContext = createContext<StoreDashboardContextValue | null>(
  null,
);

export function StoreDashboardProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: myStores } = useMyStores();
  const stores = myStores?.data ?? [];

  const pathStoreId = parseStoreIdFromPath(pathname);
  const queryStoreId = searchParams.get("storeId");
  const [manualStoreId, setManualStoreId] = useState<string | null>(null);

  const resolvedStoreId = useMemo(() => {
    const allowedIds = new Set(stores.map((s) => s.id));
    const candidates = [
      pathStoreId,
      manualStoreId,
      queryStoreId,
      typeof window !== "undefined"
        ? window.localStorage.getItem(SELECTED_STORE_STORAGE_KEY)
        : null,
      myStores?.selectedStoreId,
      stores[0]?.id,
    ];
    for (const id of candidates) {
      if (id && allowedIds.has(id)) return id;
    }
    return pathStoreId ?? queryStoreId ?? null;
  }, [pathStoreId, manualStoreId, queryStoreId, myStores, stores]);

  useEffect(() => {
    if (resolvedStoreId) {
      window.localStorage.setItem(SELECTED_STORE_STORAGE_KEY, resolvedStoreId);
    }
  }, [resolvedStoreId]);

  const setStoreId = useCallback((id: string) => {
    setManualStoreId(id);
    window.localStorage.setItem(SELECTED_STORE_STORAGE_KEY, id);
  }, []);

  const value = useMemo(
    () => ({
      storeId: resolvedStoreId,
      setStoreId,
      hasMultipleStores: stores.length > 1,
    }),
    [resolvedStoreId, setStoreId, stores.length],
  );

  return (
    <StoreDashboardContext.Provider value={value}>
      {children}
    </StoreDashboardContext.Provider>
  );
}

export function useStoreDashboard(): StoreDashboardContextValue {
  const ctx = useContext(StoreDashboardContext);
  if (!ctx) {
    throw new Error("useStoreDashboard must be used within StoreDashboardProvider");
  }
  return ctx;
}
