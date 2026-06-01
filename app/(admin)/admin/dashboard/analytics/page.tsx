import { content } from "@/content/en";
import { AdminBusinessAnalytics } from "@/components/admin/AdminBusinessAnalytics";
import { fetchInitialAdminBusinessAnalytics } from "@/lib/data/admin-business-analytics";

export default async function AdminAnalyticsPage() {
  const initial = await fetchInitialAdminBusinessAnalytics();

  return (
    <AdminBusinessAnalytics
      copy={content.admin.analytics}
      common={content.common}
      errors={content.errors}
      initialFilters={initial?.filters}
      initialData={initial?.data}
      initialParams={initial?.params}
    />
  );
}
