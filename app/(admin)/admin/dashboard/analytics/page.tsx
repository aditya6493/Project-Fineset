import { content } from "@/content/en";
import { AdminInsights } from "@/components/admin/AdminInsights";

export default function AdminAnalyticsPage() {
  return (
    <AdminInsights admin={content.admin} emptyMessage={content.admin.insights.empty} />
  );
}
