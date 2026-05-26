import { content } from "@/content/en";
import { StoresManagement } from "@/components/admin/StoresManagement";
import { fetchInitialStores } from "@/lib/data/stores";

export default async function AdminStoresPage() {
  const initial = await fetchInitialStores();

  return (
    <StoresManagement
      admin={content.admin}
      emptyMessage={content.empty.stores}
      errors={content.errors}
      initialStores={initial?.data}
      initialStoresParams={initial?.params}
    />
  );
}
