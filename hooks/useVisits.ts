import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createVisit, getVisits } from "@/lib/api/visits";
import type { CreateVisitInput } from "@/lib/validations/visit.schema";
import type { GetVisitsParams } from "@/types";

export function useVisits(params: GetVisitsParams = {}) {
  return useQuery({
    queryKey: ["visits", params],
    queryFn: () => getVisits(params),
  });
}

export function useCreateVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVisitInput) => createVisit(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["visits"] });
    },
  });
}
