import { useQuery } from "@tanstack/react-query";
import { getAdminFollowUpOverview } from "@/lib/api/follow-ups";

export function useAdminFollowUpOverview() {
  return useQuery({
    queryKey: ["follow-ups", "admin"],
    queryFn: () => getAdminFollowUpOverview(),
  });
}
