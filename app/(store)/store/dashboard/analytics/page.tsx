import { content } from "@/content/en";
import { StoreAnalyticsPage } from "@/components/store/StoreAnalyticsPage";

export default function StoreAnalyticsRoute() {
  return (
    <StoreAnalyticsPage
      store={content.store}
      emptyMessage={content.empty.insights}
    />
  );
}
