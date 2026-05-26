import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createStaff, getStaff, updateStaff } from "@/lib/api/staff";
import { invalidatePortalData } from "@/lib/sync/invalidate-portal-data";
import { LIVE_QUERY_OPTIONS } from "@/lib/sync/constants";
import type { CreateStaffInput, UpdateStaffInput } from "@/lib/validations/staff.schema";

type StoreStaffList = Awaited<ReturnType<typeof getStaff>>;

interface UseStoreStaffOptions {
  initialData?: StoreStaffList;
}

export function useStoreStaff(options?: UseStoreStaffOptions) {
  return useQuery({
    queryKey: ["staff", "store"],
    queryFn: () => getStaff(),
    initialData: options?.initialData,
    ...LIVE_QUERY_OPTIONS,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStaffInput) => createStaff(payload),
    onSuccess: () => {
      void invalidatePortalData(queryClient);
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
      void invalidatePortalData(queryClient);
    },
  });
}
