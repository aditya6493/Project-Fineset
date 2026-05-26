import { content } from "@/content/en";
import { AdminStoreDetail } from "@/components/admin/AdminStoreDetail";
import { fetchInitialAdminStoreDetail } from "@/lib/data/analytics";

interface AdminStoreDetailPageProps {
  params: Promise<{ storeId: string }>;
}

export default async function AdminStoreDetailPage({
  params,
}: AdminStoreDetailPageProps) {
  const { storeId } = await params;
  const initial = await fetchInitialAdminStoreDetail(storeId);

  return (
    <AdminStoreDetail
      storeId={storeId}
      admin={content.admin}
      storeCopy={content.store}
      initialDetail={initial?.data}
      initialParams={initial?.params}
    />
  );
}
