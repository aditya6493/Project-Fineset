import { content } from "@/content/en";
import { PortalCallsLog } from "@/components/portal/PortalCallsLog";
import { fetchInitialPortalCalls } from "@/lib/data/portal-calls";

interface AdminCallsPageProps {
  searchParams: Promise<{ storeId?: string }>;
}

export default async function AdminCallsPage({ searchParams }: AdminCallsPageProps) {
  const { storeId } = await searchParams;
  const initial = await fetchInitialPortalCalls(storeId);

  return (
    <PortalCallsLog
      copy={content.portal.calls}
      common={content.common}
      emptyMessage={content.empty.portalCalls}
      allStoresLabel={content.portal.allStores}
      allStaffLabel={content.portal.allStaff}
      showStoreFilter
      initialStoreId={storeId}
      initialPortalCalls={initial?.data}
      initialPortalCallsParams={initial?.params}
    />
  );
}
