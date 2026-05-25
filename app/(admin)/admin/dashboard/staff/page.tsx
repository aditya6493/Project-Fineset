import { content } from "@/content/en";
import { StaffAnalytics } from "@/components/admin/StaffAnalytics";

export default function AdminStaffPage() {
  return (
    <StaffAnalytics
      admin={content.admin}
      common={content.common}
      emptyMessage={content.empty.staff}
      allStoresLabel={content.admin.staff.allStores}
    />
  );
}
