import { StoreVisitsPageClient } from "@/components/store/StoreVisitsPageClient";
import { fetchInitialStoreStaff } from "@/lib/data/staff";
import { fetchInitialVisits } from "@/lib/data/visits";

interface StoreVisitsPageProps {
  searchParams: Promise<{ storeId?: string }>;
}

export default async function StoreVisitsPage({ searchParams }: StoreVisitsPageProps) {
  const { storeId } = await searchParams;
  let initialVisits: Awaited<ReturnType<typeof fetchInitialVisits>> = null;
  let initialStaff: Awaited<ReturnType<typeof fetchInitialStoreStaff>> = null;
  try {
    [initialVisits, initialStaff] = await Promise.all([
      fetchInitialVisits(storeId),
      fetchInitialStoreStaff(storeId),
    ]);
  } catch (error) {
    console.error("[store-visits] initial data failed", { storeId, error });
  }

  return (
    <StoreVisitsPageClient
      urlStoreId={storeId}
      initialVisits={initialVisits?.data}
      initialVisitsParams={initialVisits?.params}
      initialStaff={initialStaff?.data}
    />
  );
}
