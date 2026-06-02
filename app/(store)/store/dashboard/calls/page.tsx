import { content } from "@/content/en";
import { PortalCallsLog } from "@/components/portal/PortalCallsLog";
import { fetchInitialPortalCalls } from "@/lib/data/portal-calls";
import { parsePortalCallsSearchParams } from "@/lib/utils/portal-calls-url";

interface StoreCallsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function StoreCallsPage({ searchParams }: StoreCallsPageProps) {
  const urlFilters = parsePortalCallsSearchParams(await searchParams);
  let initial: Awaited<ReturnType<typeof fetchInitialPortalCalls>> = null;
  try {
    initial = await fetchInitialPortalCalls(undefined, urlFilters);
  } catch (error) {
    console.error("[store-calls] initial portal calls failed", { urlFilters, error });
  }

  return (
    <PortalCallsLog
      copy={content.portal.calls}
      common={content.common}
      emptyMessage={content.empty.portalCalls}
      allStoresLabel={content.portal.allStores}
      allStaffLabel={content.portal.allStaff}
      initialPortalCalls={initial?.data}
      initialPortalCallsParams={initial?.params}
    />
  );
}
