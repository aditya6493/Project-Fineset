import { content } from "@/content/en";
import { AdminOverview } from "@/components/admin/AdminOverview";

export default function AdminDashboardPage() {
  return <AdminOverview admin={content.admin} />;
}
