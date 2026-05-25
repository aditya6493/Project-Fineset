import { content } from "@/content/en";
import { StoresManagement } from "@/components/admin/StoresManagement";

export default function AdminStoresPage() {
  return (
    <StoresManagement
      admin={content.admin}
      emptyMessage={content.empty.stores}
      errors={content.errors}
    />
  );
}
