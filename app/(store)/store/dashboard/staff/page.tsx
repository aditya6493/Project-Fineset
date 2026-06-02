import { content } from "@/content/en";
import { StaffManagement } from "@/components/store/StaffManagement";
import { fetchInitialStoreStaff } from "@/lib/data/staff";

export default async function StoreStaffPage() {
  let initial: Awaited<ReturnType<typeof fetchInitialStoreStaff>> = null;
  try {
    initial = await fetchInitialStoreStaff();
  } catch (error) {
    console.error("[store-staff] initial staff failed", error);
  }

  return (
    <StaffManagement
      store={content.store}
      emptyMessage={content.empty.staff}
      errors={content.errors}
      initialStaff={initial?.data}
    />
  );
}
