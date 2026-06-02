import { content } from "@/content/en";
import { StoreVisitsLog } from "@/components/store/StoreVisitsLog";
import { fetchInitialVisits } from "@/lib/data/visits";

export default async function StoreVisitsPage() {
  let initial: Awaited<ReturnType<typeof fetchInitialVisits>> = null;
  try {
    initial = await fetchInitialVisits();
  } catch (error) {
    console.error("[store-visits] initial visits failed", error);
  }

  return (
    <StoreVisitsLog
      store={content.store}
      visitFields={content.visitForm.fields}
      common={content.common}
      emptyMessage={content.empty.visits}
      initialVisits={initial?.data}
      initialVisitsParams={initial?.params}
    />
  );
}
