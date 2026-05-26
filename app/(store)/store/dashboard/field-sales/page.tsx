import { content } from "@/content/en";
import { PortalFieldSalesLog } from "@/components/portal/PortalFieldSalesLog";
import { fetchInitialFieldSales } from "@/lib/data/field-sales";

export default async function StoreFieldSalesPage() {
  const initial = await fetchInitialFieldSales();

  return (
    <PortalFieldSalesLog
      copy={content.portal.fieldSales}
      common={content.common}
      emptyMessage={content.empty.fieldSales}
      allStoresLabel={content.portal.allStores}
      allStaffLabel={content.portal.allStaff}
      initialFieldSales={initial?.data}
      initialFieldSalesParams={initial?.params}
    />
  );
}
