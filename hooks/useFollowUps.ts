import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFollowUps, updateFollowUpStatus } from "@/lib/api/follow-ups";
import type { FollowUpStatus } from "@/types";

interface UseFollowUpsParams {
  status?: FollowUpStatus;
  overdue?: boolean;
}

export function useFollowUps(params: UseFollowUpsParams = {}) {
  return useQuery({
    queryKey: ["follow-ups", params],
    queryFn: () => getFollowUps(params),
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
      void queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
    },
  });
}
