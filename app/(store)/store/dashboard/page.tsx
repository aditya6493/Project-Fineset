import { content } from "@/content/en";
import { StoreOverview } from "@/components/store/StoreOverview";
import { fetchInitialStoreAnalytics } from "@/lib/data/analytics";

export default async function StoreDashboardPage() {
  let initial: Awaited<ReturnType<typeof fetchInitialStoreAnalytics>> = null;
  try {
    initial = await fetchInitialStoreAnalytics();
  } catch (error) {
    console.error("[store-dashboard] initial analytics failed", error);
  }

  return (
    <StoreOverview
      store={content.store}
      initialAnalytics={initial?.data}
      initialAnalyticsParams={initial?.params}
    />
  );
}
