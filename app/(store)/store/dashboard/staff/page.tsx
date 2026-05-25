import { content } from "@/content/en";
import { StaffManagement } from "@/components/store/StaffManagement";

export default function StoreStaffPage() {
  return (
    <StaffManagement
      store={content.store}
      emptyMessage={content.empty.staff}
      errors={content.errors}
    />
  );
}
