import { content } from "@/content/en";
import { StoreOverview } from "@/components/store/StoreOverview";
import { fetchInitialStoreAnalytics } from "@/lib/data/analytics";
import { getServerSession } from "@/lib/auth/session";

export default async function StoreDashboardPage() {
  const session = await getServerSession();
  const initialStoreId =
    session?.role === "STORE_MANAGER" ? session.storeId : undefined;

  let initial: Awaited<ReturnType<typeof fetchInitialStoreAnalytics>> = null;
  try {
    initial = await fetchInitialStoreAnalytics(
      initialStoreId ? { storeId: initialStoreId } : {},
    );
  } catch (error) {
    console.error("[store-dashboard] initial analytics failed", error);
  }

  return (
    <StoreOverview
      store={content.store}
      initialStoreId={initialStoreId}
      initialAnalytics={initial?.data}
      initialAnalyticsParams={initial?.params}
    />
  );
}
