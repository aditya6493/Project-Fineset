import { content } from "@/content/en";
import { AdminBusinessAnalytics } from "@/components/admin/AdminBusinessAnalytics";

export default function AdminAnalyticsPage() {
  return (
    <AdminBusinessAnalytics
      copy={content.admin.analytics}
      common={content.common}
      errors={content.errors}
    />
  );
}
