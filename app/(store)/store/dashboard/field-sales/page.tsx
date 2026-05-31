import { content } from "@/content/en";
import { PortalFieldSalesLog } from "@/components/portal/PortalFieldSalesLog";
import { fetchInitialFieldSales } from "@/lib/data/field-sales";
import { parseFieldSalesSearchParams } from "@/lib/utils/field-sales-url";

interface StoreFieldSalesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function StoreFieldSalesPage({ searchParams }: StoreFieldSalesPageProps) {
  const urlFilters = parseFieldSalesSearchParams(await searchParams);
  const initial = await fetchInitialFieldSales(undefined, urlFilters);

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
