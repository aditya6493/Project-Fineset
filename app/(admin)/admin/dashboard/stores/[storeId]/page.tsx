import { content } from "@/content/en";
import { AdminStoreDetail } from "@/components/admin/AdminStoreDetail";

interface AdminStoreDetailPageProps {
  params: Promise<{ storeId: string }>;
}

export default async function AdminStoreDetailPage({
  params,
}: AdminStoreDetailPageProps) {
  const { storeId } = await params;

  return (
    <AdminStoreDetail
      storeId={storeId}
      admin={content.admin}
      storeCopy={content.store}
    />
  );
}
