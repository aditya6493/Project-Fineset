import { content } from "@/content/en";
import { StoreOverview } from "@/components/store/StoreOverview";
import { fetchInitialStoreAnalytics } from "@/lib/data/analytics";

export default async function StoreDashboardPage() {
  const initial = await fetchInitialStoreAnalytics();

  return (
    <StoreOverview
      store={content.store}
      initialAnalytics={initial?.data}
      initialAnalyticsParams={initial?.params}
    />
  );
}
