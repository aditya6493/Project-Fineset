import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createStaff, getStaff, updateStaff } from "@/lib/api/staff";
import type { CreateStaffInput, UpdateStaffInput } from "@/lib/validations/staff.schema";

export function useStoreStaff() {
  return useQuery({
    queryKey: ["staff", "store"],
    queryFn: () => getStaff(),
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStaffInput) => createStaff(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      staffId,
      payload,
    }: {
      staffId: string;
      payload: UpdateStaffInput;
    }) => updateStaff(staffId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
}
