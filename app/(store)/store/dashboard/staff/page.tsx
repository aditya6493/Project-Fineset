import { content } from "@/content/en";
import { StaffManagement } from "@/components/store/StaffManagement";
import { fetchInitialStoreStaff } from "@/lib/data/staff";

export default async function StoreStaffPage() {
  const initial = await fetchInitialStoreStaff();

  return (
    <StaffManagement
      store={content.store}
      emptyMessage={content.empty.staff}
      errors={content.errors}
      initialStaff={initial?.data}
    />
  );
}
