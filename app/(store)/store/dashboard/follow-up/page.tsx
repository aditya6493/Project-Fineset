import { content } from "@/content/en";
import { FollowUpPipeline } from "@/components/store/FollowUpPipeline";

export default function StoreFollowUpPage() {
  return (
    <FollowUpPipeline store={content.store} emptyMessage={content.empty.followUps} />
  );
}
