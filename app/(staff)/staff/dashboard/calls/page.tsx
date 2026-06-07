import { content } from "@/content/en";
import { StaffCallList } from "@/components/staff/StaffCallList";
import { parseStaffCallsSearchParams } from "@/lib/utils/staff-calls-url";

interface StaffCallsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function StaffCallsPage({ searchParams }: StaffCallsPageProps) {
  const resolved = await searchParams;
  const urlFilters = parseStaffCallsSearchParams(resolved);

  return (
    <StaffCallList
      copy={content.staff}
      emptyMessage={content.empty.staffCalls}
      initialCallsParams={urlFilters}
    />
  );
}
