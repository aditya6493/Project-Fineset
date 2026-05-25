import { content } from "@/content/en";
import { StoreOverview } from "@/components/store/StoreOverview";

export default function StoreDashboardPage() {
  return (
    <StoreOverview store={content.store} visitFields={content.visitForm.fields} />
  );
}
