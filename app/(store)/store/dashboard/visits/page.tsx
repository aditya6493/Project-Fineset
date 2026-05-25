import { content } from "@/content/en";
import { StoreVisitsLog } from "@/components/store/StoreVisitsLog";

export default function StoreVisitsPage() {
  return (
    <StoreVisitsLog
      store={content.store}
      visitFields={content.visitForm.fields}
      common={content.common}
      emptyMessage={content.empty.visits}
    />
  );
}
