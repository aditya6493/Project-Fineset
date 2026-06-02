import { content } from "@/content/en";
import { PortalFieldSalesLog } from "@/components/portal/PortalFieldSalesLog";
import { fetchInitialFieldSales } from "@/lib/data/field-sales";
import { parseFieldSalesSearchParams } from "@/lib/utils/field-sales-url";

interface StoreFieldSalesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function StoreFieldSalesPage({ searchParams }: StoreFieldSalesPageProps) {
  const urlFilters = parseFieldSalesSearchParams(await searchParams);
  let initial: Awaited<ReturnType<typeof fetchInitialFieldSales>> = null;
  try {
    initial = await fetchInitialFieldSales(undefined, urlFilters);
  } catch (error) {
    console.error("[store-field-sales] initial field sales failed", {
      urlFilters,
      error,
    });
  }

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
