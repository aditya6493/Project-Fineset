import { content } from "@/content/en";
import { PortalFieldSalesLog } from "@/components/portal/PortalFieldSalesLog";

interface AdminFieldSalesPageProps {
  searchParams: Promise<{ storeId?: string }>;
}

export default async function AdminFieldSalesPage({
  searchParams,
}: AdminFieldSalesPageProps) {
  const { storeId } = await searchParams;

  return (
    <PortalFieldSalesLog
      copy={content.portal.fieldSales}
      common={content.common}
      emptyMessage={content.empty.fieldSales}
      allStoresLabel={content.portal.allStores}
      allStaffLabel={content.portal.allStaff}
      showStoreFilter
      initialStoreId={storeId}
    />
  );
}
