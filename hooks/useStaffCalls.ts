import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getStaffCalls,
  revealStaffCallPhone,
  submitStaffCallOutcome,
} from "@/lib/api/staff-calls";
import { staffCallsParamsMatch } from "@/lib/query/initial-data";
import { invalidatePortalData } from "@/lib/sync/invalidate-portal-data";
import { LIVE_QUERY_OPTIONS } from "@/lib/sync/constants";
import type { GetStaffCallsParams, StaffCallListResponse } from "@/types";
import type { StaffCallOutcomeInput } from "@/lib/validations/staff-calls.schema";

interface UseStaffCallsOptions {
  initialData?: StaffCallListResponse;
  initialParams?: GetStaffCallsParams;
}

export function useStaffCalls(params: GetStaffCallsParams, options?: UseStaffCallsOptions) {
  const useInitialData =
    options?.initialData &&
    options.initialParams &&
    staffCallsParamsMatch(params, options.initialParams);

  return useQuery({
    queryKey: ["staff-calls", params],
    queryFn: () => getStaffCalls(params),
    initialData: useInitialData ? options.initialData : undefined,
    ...LIVE_QUERY_OPTIONS,
  });
}

export function useRevealStaffCallPhone() {
  return useMutation({
    mutationFn: (visitId: string) => revealStaffCallPhone(visitId),
  });
}

export function useSubmitStaffCallOutcome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      visitId,
      payload,
    }: {
      visitId: string;
      payload: StaffCallOutcomeInput;
    }) => submitStaffCallOutcome(visitId, payload),
    onSuccess: () => {
      void invalidatePortalData(queryClient);
    },
  });
}
