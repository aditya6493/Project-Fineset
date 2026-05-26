import { content } from "@/content/en";
import { StoreVisitsLog } from "@/components/store/StoreVisitsLog";
import { fetchInitialVisits } from "@/lib/data/visits";

export default async function StoreVisitsPage() {
  const initial = await fetchInitialVisits();

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
