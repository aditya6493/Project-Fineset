import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createVisit, getVisits } from "@/lib/api/visits";
import { visitsParamsMatch } from "@/lib/query/initial-data";
import { invalidatePortalData } from "@/lib/sync/invalidate-portal-data";
import { LIVE_QUERY_OPTIONS, queryOptionsForHydration } from "@/lib/sync/constants";
import type { CreateVisitInput } from "@/lib/validations/visit.schema";
import type { GetVisitsParams, PaginatedResponse, VisitListItem } from "@/types";

interface UseVisitsOptions {
  initialData?: PaginatedResponse<VisitListItem>;
  initialParams?: GetVisitsParams;
}

export function useVisits(params: GetVisitsParams = {}, options?: UseVisitsOptions) {
  const useInitialData =
    options?.initialData &&
    options.initialParams &&
    visitsParamsMatch(params, options.initialParams);

  return useQuery({
    queryKey: ["visits", params],
    queryFn: () => getVisits(params),
    initialData: useInitialData ? options.initialData : undefined,
    ...LIVE_QUERY_OPTIONS,
    ...queryOptionsForHydration(Boolean(useInitialData)),
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
