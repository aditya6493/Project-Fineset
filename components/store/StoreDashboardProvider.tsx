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
import type { MyStoresResponse, StorePortalSession } from "@/types";

interface StoreDashboardContextValue {
  storeId: string | null;
  setStoreId: (id: string) => void;
  hasMultipleStores: boolean;
  isSingleStoreManager: boolean;
}

const StoreDashboardContext = createContext<StoreDashboardContextValue | null>(
  null,
);

interface StoreDashboardProviderProps {
  children: ReactNode;
  portalRole: StorePortalSession["role"];
  assignedStoreId: string;
  initialMyStores?: MyStoresResponse;
}

function SingleStoreDashboardProvider({
  children,
  assignedStoreId,
}: {
  children: ReactNode;
  assignedStoreId: string;
}) {
  const value = useMemo(
    () => ({
      storeId: assignedStoreId,
      setStoreId: () => {},
      hasMultipleStores: false,
      isSingleStoreManager: true,
    }),
    [assignedStoreId],
  );

  return (
    <StoreDashboardContext.Provider value={value}>
      {children}
    </StoreDashboardContext.Provider>
  );
}

function MultiStoreDashboardProvider({
  children,
  assignedStoreId,
  initialMyStores,
}: {
  children: ReactNode;
  assignedStoreId: string;
  initialMyStores: MyStoresResponse;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const stores = initialMyStores.data;
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
      initialMyStores.selectedStoreId,
      stores[0]?.id,
    ];
    for (const id of candidates) {
      if (id && allowedIds.has(id)) return id;
    }
    return pathStoreId ?? queryStoreId ?? assignedStoreId;
  }, [
    assignedStoreId,
    pathStoreId,
    manualStoreId,
    queryStoreId,
    initialMyStores.selectedStoreId,
    stores,
  ]);

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
      isSingleStoreManager: false,
    }),
    [resolvedStoreId, setStoreId, stores.length],
  );

  return (
    <StoreDashboardContext.Provider value={value}>
      {children}
    </StoreDashboardContext.Provider>
  );
}

export function StoreDashboardProvider({
  children,
  portalRole,
  assignedStoreId,
  initialMyStores,
}: StoreDashboardProviderProps) {
  if (portalRole === "STORE_MANAGER") {
    return (
      <SingleStoreDashboardProvider assignedStoreId={assignedStoreId}>
        {children}
      </SingleStoreDashboardProvider>
    );
  }

  if (!initialMyStores) {
    throw new Error("Business owner dashboard requires initialMyStores");
  }

  return (
    <MultiStoreDashboardProvider
      assignedStoreId={assignedStoreId}
      initialMyStores={initialMyStores}
    >
      {children}
    </MultiStoreDashboardProvider>
  );
}

export function useStoreDashboard(): StoreDashboardContextValue {
  const ctx = useContext(StoreDashboardContext);
  if (!ctx) {
    throw new Error("useStoreDashboard must be used within StoreDashboardProvider");
  }
  return ctx;
}
