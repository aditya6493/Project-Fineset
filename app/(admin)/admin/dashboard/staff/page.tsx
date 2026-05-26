import { content } from "@/content/en";
import { StaffAnalytics } from "@/components/admin/StaffAnalytics";
import {
  fetchInitialStaffFilterStores,
  fetchInitialStaffPerformance,
} from "@/lib/data/staff";

interface AdminStaffPageProps {
  searchParams: Promise<{ storeId?: string }>;
}

export default async function AdminStaffPage({ searchParams }: AdminStaffPageProps) {
  const { storeId } = await searchParams;
  const [performance, stores] = await Promise.all([
    fetchInitialStaffPerformance(storeId),
    fetchInitialStaffFilterStores(),
  ]);

  return (
    <StaffAnalytics
      admin={content.admin}
      common={content.common}
      emptyMessage={content.empty.staff}
      allStoresLabel={content.admin.staff.allStores}
      initialStoreId={storeId}
      initialPerformance={performance?.data}
      initialStoreFilter={performance?.storeFilter}
      initialStores={stores?.data}
    />
  );
}
