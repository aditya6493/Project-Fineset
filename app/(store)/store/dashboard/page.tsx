import { content } from "@/content/en";
import { StorePortfolio } from "@/components/store/StorePortfolio";
import { fetchInitialStoreManagerPortfolio } from "@/lib/data/analytics";
import { parsePeriodParam } from "@/lib/utils/analytics-period-url";

interface StoreDashboardPageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function StoreDashboardPage({
  searchParams,
}: StoreDashboardPageProps) {
  const { period: periodParam } = await searchParams;
  const period = parsePeriodParam(periodParam);

  let initial: Awaited<ReturnType<typeof fetchInitialStoreManagerPortfolio>> = null;
  try {
    initial = await fetchInitialStoreManagerPortfolio({ period });
  } catch (error) {
    console.error("[store-dashboard] initial portfolio failed", error);
  }

  return (
    <StorePortfolio
      store={content.store}
      initialPortfolio={initial?.data}
      initialParams={initial?.params}
    />
  );
}
