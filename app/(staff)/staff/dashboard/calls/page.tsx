import { content } from "@/content/en";
import { RealtimeSyncProvider } from "@/components/layout/RealtimeSyncProvider";
import { StaffCallList } from "@/components/staff/StaffCallList";
import { fetchInitialStaffCalls } from "@/lib/data/staff-calls";

export default async function StaffCallsPage() {
  const initial = await fetchInitialStaffCalls();

  return (
    <RealtimeSyncProvider>
      <StaffCallList
        copy={content.staff}
        emptyMessage={content.empty.staffCalls}
        initialCalls={initial?.data}
        initialCallsParams={initial?.params}
      />
    </RealtimeSyncProvider>
  );
}
