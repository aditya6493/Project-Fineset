import { content } from "@/content/en";
import { PortalCallsLog } from "@/components/portal/PortalCallsLog";

interface AdminCallsPageProps {
  searchParams: Promise<{ storeId?: string }>;
}

export default async function AdminCallsPage({ searchParams }: AdminCallsPageProps) {
  const { storeId } = await searchParams;

  return (
    <PortalCallsLog
      copy={content.portal.calls}
      common={content.common}
      emptyMessage={content.empty.portalCalls}
      allStoresLabel={content.portal.allStores}
      allStaffLabel={content.portal.allStaff}
      showStoreFilter
      initialStoreId={storeId}
    />
  );
}
