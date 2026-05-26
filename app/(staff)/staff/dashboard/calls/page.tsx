import { content } from "@/content/en";
import { StaffCallList } from "@/components/staff/StaffCallList";

export default function StaffCallsPage() {
  return (
    <StaffCallList copy={content.staff} emptyMessage={content.empty.staffCalls} />
  );
}
