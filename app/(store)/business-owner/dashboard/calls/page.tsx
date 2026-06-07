import { StoreCallsPageClient } from "@/components/store/StoreCallsPageClient";
import { fetchInitialPortalCalls } from "@/lib/data/portal-calls";
import { parsePortalCallsSearchParams } from "@/lib/utils/portal-calls-url";

interface StoreCallsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function StoreCallsPage({ searchParams }: StoreCallsPageProps) {
  const resolved = await searchParams;
  const urlFilters = parsePortalCallsSearchParams(resolved);
  const storeId =
    typeof resolved.storeId === "string" ? resolved.storeId : undefined;

  let initial: Awaited<ReturnType<typeof fetchInitialPortalCalls>> = null;
  try {
    initial = await fetchInitialPortalCalls(storeId, urlFilters);
  } catch (error) {
    console.error("[store-calls] initial portal calls failed", { storeId, error });
  }

  return (
    <StoreCallsPageClient
      urlStoreId={storeId}
      initialPortalCalls={initial?.data}
      initialPortalCallsParams={initial?.params}
    />
  );
}
