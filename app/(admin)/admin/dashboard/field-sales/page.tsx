import { content } from "@/content/en";
import { PortalFieldSalesLog } from "@/components/portal/PortalFieldSalesLog";
import { fetchInitialFieldSales } from "@/lib/data/field-sales";

interface AdminFieldSalesPageProps {
  searchParams: Promise<{ storeId?: string }>;
}

export default async function AdminFieldSalesPage({
  searchParams,
}: AdminFieldSalesPageProps) {
  const { storeId } = await searchParams;
  const initial = await fetchInitialFieldSales(storeId);

  return (
    <PortalFieldSalesLog
      copy={content.portal.fieldSales}
      common={content.common}
      emptyMessage={content.empty.fieldSales}
      allStoresLabel={content.portal.allStores}
      allStaffLabel={content.portal.allStaff}
      showStoreFilter
      initialStoreId={storeId}
      initialFieldSales={initial?.data}
      initialFieldSalesParams={initial?.params}
      backHref={storeId ? `/admin/dashboard/stores/${storeId}` : undefined}
      backLabel={content.common.back}
    />
  );
}
