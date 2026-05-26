import { content } from "@/content/en";
import { PortalFieldSalesLog } from "@/components/portal/PortalFieldSalesLog";

export default function StoreFieldSalesPage() {
  return (
    <PortalFieldSalesLog
      copy={content.portal.fieldSales}
      common={content.common}
      emptyMessage={content.empty.fieldSales}
      allStoresLabel={content.portal.allStores}
      allStaffLabel={content.portal.allStaff}
    />
  );
}
