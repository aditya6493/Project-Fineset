import { content } from "@/content/en";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { fetchInitialAdminOverview } from "@/lib/data/analytics";

export default async function AdminDashboardPage() {
  const initial = await fetchInitialAdminOverview();

  return (
    <AdminOverview
      admin={content.admin}
      initialOverview={initial?.data}
      initialParams={initial?.params}
    />
  );
}
