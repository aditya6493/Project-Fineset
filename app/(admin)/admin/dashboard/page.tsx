import { content } from "@/content/en";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { fetchInitialAdminOverview } from "@/lib/data/analytics";

export default async function AdminDashboardPage() {
  let initial: Awaited<ReturnType<typeof fetchInitialAdminOverview>> = null;
  try {
    initial = await fetchInitialAdminOverview();
  } catch (error) {
    console.error("[admin-dashboard] initial overview failed", error);
  }

  return (
    <AdminOverview
      admin={content.admin}
      initialOverview={initial?.data}
      initialParams={initial?.params}
    />
  );
}
