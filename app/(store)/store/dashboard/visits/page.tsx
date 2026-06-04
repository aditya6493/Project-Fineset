import { content } from "@/content/en";
import { StoreVisitsLog } from "@/components/store/StoreVisitsLog";
import { fetchInitialStoreStaff } from "@/lib/data/staff";
import { fetchInitialVisits } from "@/lib/data/visits";

export default async function StoreVisitsPage() {
  let initialVisits: Awaited<ReturnType<typeof fetchInitialVisits>> = null;
  let initialStaff: Awaited<ReturnType<typeof fetchInitialStoreStaff>> = null;
  try {
    [initialVisits, initialStaff] = await Promise.all([
      fetchInitialVisits(),
      fetchInitialStoreStaff(),
    ]);
  } catch (error) {
    console.error("[store-visits] initial data failed", error);
  }

  return (
    <StoreVisitsLog
      store={content.store}
      visitFields={content.visitForm.fields}
      common={content.common}
      emptyMessage={content.empty.visits}
      initialVisits={initialVisits?.data}
      initialVisitsParams={initialVisits?.params}
      initialStaff={initialStaff?.data}
    />
  );
}
