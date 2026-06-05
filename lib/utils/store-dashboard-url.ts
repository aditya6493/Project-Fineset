const SELECTED_STORE_STORAGE_KEY = "fineset-manager-selected-store-id";

export { SELECTED_STORE_STORAGE_KEY };

export function appendStoreQuery(
  path: string,
  storeId?: string | null,
): string {
  if (!storeId) return path;
  const [base, search = ""] = path.split("?");
  const params = new URLSearchParams(search);
  params.set("storeId", storeId);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function storeDetailPath(storeId: string): string {
  return `/store/dashboard/stores/${storeId}`;
}

export function storeDetailHref(storeId: string, period?: string): string {
  const path = storeDetailPath(storeId);
  if (!period) return path;
  return `${path}?period=${encodeURIComponent(period)}`;
}

export function parseStoreIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/store\/dashboard\/stores\/([^/]+)/);
  return match?.[1] ?? null;
}
