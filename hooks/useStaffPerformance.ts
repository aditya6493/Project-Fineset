import { useQuery } from "@tanstack/react-query";
import { getStaffPerformance } from "@/lib/api/staff";
import { staffPerformanceStoreFilterMatch } from "@/lib/query/initial-data";
import { LIVE_QUERY_OPTIONS, queryOptionsForHydration } from "@/lib/sync/constants";
import type { StaffPerformanceRow } from "@/types";

interface UseStaffPerformanceOptions {
  initialData?: StaffPerformanceRow[];
  initialStoreFilter?: string;
}

export function useStaffPerformance(
  storeFilter: string = "all",
  options?: UseStaffPerformanceOptions,
) {
  const storeId = storeFilter === "all" ? undefined : storeFilter;
  const useInitialData =
    options?.initialData &&
    options.initialStoreFilter !== undefined &&
    staffPerformanceStoreFilterMatch(storeFilter, options.initialStoreFilter);

  return useQuery({
    queryKey: ["staff", "performance", storeFilter],
    queryFn: () => getStaffPerformance(storeId),
    initialData: useInitialData ? options.initialData : undefined,
    ...LIVE_QUERY_OPTIONS,
    ...queryOptionsForHydration(Boolean(useInitialData)),
  });
}
