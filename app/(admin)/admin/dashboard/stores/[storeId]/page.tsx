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
  let initial: Awaited<ReturnType<typeof fetchInitialAdminStoreDetail>> = null;
  try {
    initial = await fetchInitialAdminStoreDetail(storeId);
  } catch (error) {
    console.error("[admin-store-detail] initial detail failed", { storeId, error });
  }

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
