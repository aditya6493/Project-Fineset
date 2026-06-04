import { content } from "@/content/en";
import { StoreOverview } from "@/components/store/StoreOverview";
import { fetchInitialStoreOverviewBundle } from "@/lib/data/analytics";
import { getServerSession } from "@/lib/auth/session";

export default async function StoreDashboardPage() {
  const session = await getServerSession();
  const initialStoreId =
    session?.role === "STORE_MANAGER" ? session.storeId : undefined;

  let initial: Awaited<ReturnType<typeof fetchInitialStoreOverviewBundle>> = null;
  try {
    initial = await fetchInitialStoreOverviewBundle(
      initialStoreId ? { storeId: initialStoreId } : {},
    );
  } catch (error) {
    console.error("[store-dashboard] initial overview bundle failed", error);
  }

  return (
    <StoreOverview
      store={content.store}
      initialStoreId={initial?.params.storeId ?? initialStoreId}
      initialOverviewBundle={initial?.bundle}
      initialOverviewParams={initial?.params}
    />
  );
}
