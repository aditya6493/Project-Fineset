import { content } from "@/content/en";
import { FollowUpOverview } from "@/components/admin/FollowUpOverview";

export default function AdminFollowUpPage() {
  return (
    <FollowUpOverview
      admin={content.admin}
      emptyMessage={content.empty.followUps}
    />
  );
}
