import { useQuery } from "@tanstack/react-query";
import { getStaffPerformance } from "@/lib/api/staff";
import { LIVE_QUERY_OPTIONS } from "@/lib/sync/constants";

export function useStaffPerformance(storeId?: string) {
  return useQuery({
    queryKey: ["staff", "performance", storeId],
    queryFn: () => getStaffPerformance(storeId),
    ...LIVE_QUERY_OPTIONS,
  });
}
