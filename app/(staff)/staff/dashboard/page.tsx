import { content } from "@/content/en";
import { StaffPortal } from "@/components/staff/StaffPortal";

export default function StaffDashboardPage() {
  return <StaffPortal copy={content.staff} />;
}
