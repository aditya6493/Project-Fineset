import { content } from "@/content/en";
import { PortalCallsLog } from "@/components/portal/PortalCallsLog";

export default function StoreCallsPage() {
  return (
    <PortalCallsLog
      copy={content.portal.calls}
      common={content.common}
      emptyMessage={content.empty.portalCalls}
      allStoresLabel={content.portal.allStores}
      allStaffLabel={content.portal.allStaff}
    />
  );
}
