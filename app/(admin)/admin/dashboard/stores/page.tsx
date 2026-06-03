import { content } from "@/content/en";
import { StoresManagement } from "@/components/admin/StoresManagement";
import { fetchInitialStores } from "@/lib/data/stores";

export default async function AdminStoresPage() {
  let initial: Awaited<ReturnType<typeof fetchInitialStores>> = null;
  try {
    initial = await fetchInitialStores();
  } catch (error) {
    console.error("[admin-stores] initial stores failed", error);
  }

  return (
    <StoresManagement
      admin={content.admin}
      common={content.common}
      emptyMessage={content.empty.stores}
      errors={content.errors}
      initialStores={initial?.data}
      initialStoresParams={initial?.params}
    />
  );
}
