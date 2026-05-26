import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createVisit, getVisits } from "@/lib/api/visits";
import { invalidatePortalData } from "@/lib/sync/invalidate-portal-data";
import { LIVE_QUERY_OPTIONS } from "@/lib/sync/constants";
import type { CreateVisitInput } from "@/lib/validations/visit.schema";
import type { GetVisitsParams } from "@/types";

export function useVisits(params: GetVisitsParams = {}) {
  return useQuery({
    queryKey: ["visits", params],
    queryFn: () => getVisits(params),
    ...LIVE_QUERY_OPTIONS,
  });
}

export function useCreateVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVisitInput) => createVisit(payload),
    onSuccess: () => {
      void invalidatePortalData(queryClient);
    },
  });
}
