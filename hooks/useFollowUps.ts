import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFollowUps, updateFollowUpStatus } from "@/lib/api/follow-ups";
import { invalidatePortalData } from "@/lib/sync/invalidate-portal-data";
import { LIVE_QUERY_OPTIONS } from "@/lib/sync/constants";
import type { FollowUpStatus } from "@/types";

interface UseFollowUpsParams {
  status?: FollowUpStatus;
  overdue?: boolean;
}

export function useFollowUps(params: UseFollowUpsParams = {}) {
  return useQuery({
    queryKey: ["follow-ups", params],
    queryFn: () => getFollowUps(params),
    ...LIVE_QUERY_OPTIONS,
  });
}

export function useUpdateFollowUpStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      followUpId,
      status,
    }: {
      followUpId: string;
      status: FollowUpStatus;
    }) => updateFollowUpStatus(followUpId, status),
    onSuccess: () => {
      void invalidatePortalData(queryClient);
    },
  });
}
