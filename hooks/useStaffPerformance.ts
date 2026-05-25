import { useQuery } from "@tanstack/react-query";
import { getStaffPerformance } from "@/lib/api/staff";

export function useStaffPerformance(storeId?: string) {
  return useQuery({
    queryKey: ["staff", "performance", storeId],
    queryFn: () => getStaffPerformance(storeId),
  });
}
