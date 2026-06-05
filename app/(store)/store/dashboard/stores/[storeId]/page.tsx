import { content } from "@/content/en";
import { StoreDetailOverview } from "@/components/store/StoreDetailOverview";
import { fetchInitialStoreOverviewBundle } from "@/lib/data/analytics";
import { parsePeriodParam } from "@/lib/utils/analytics-period-url";

interface StoreDetailPageProps {
  params: Promise<{ storeId: string }>;
  searchParams: Promise<{ period?: string }>;
}

export default async function StoreDetailDashboardPage({
  params,
  searchParams,
}: StoreDetailPageProps) {
  const { storeId } = await params;
  const { period: periodParam } = await searchParams;
  const period = parsePeriodParam(periodParam);

  let initial: Awaited<ReturnType<typeof fetchInitialStoreOverviewBundle>> = null;
  try {
    initial = await fetchInitialStoreOverviewBundle({ storeId, period });
  } catch (error) {
    console.error("[store-dashboard] initial store detail failed", { storeId, error });
  }

  return (
    <StoreDetailOverview
      storeId={storeId}
      store={content.store}
      initialOverviewBundle={initial?.bundle}
      initialOverviewParams={initial?.params}
    />
  );
}
