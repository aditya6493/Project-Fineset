import { content } from "@/content/en";
import { StaffAnalytics } from "@/components/admin/StaffAnalytics";

interface AdminStaffPageProps {
  searchParams: Promise<{ storeId?: string }>;
}

export default async function AdminStaffPage({ searchParams }: AdminStaffPageProps) {
  const { storeId } = await searchParams;

  return (
    <StaffAnalytics
      admin={content.admin}
      common={content.common}
      emptyMessage={content.empty.staff}
      allStoresLabel={content.admin.staff.allStores}
      initialStoreId={storeId}
    />
  );
}
