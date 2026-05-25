import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createStore, getStores, updateStore } from "@/lib/api/stores";
import type { CreateStoreInput, UpdateStoreInput } from "@/lib/validations/store.schema";

interface UseStoresParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export function useStores(params: UseStoresParams = {}) {
  return useQuery({
    queryKey: ["stores", params],
    queryFn: () => getStores(params),
  });
}

export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStoreInput) => createStore(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
}

export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storeId,
      payload,
    }: {
      storeId: string;
      payload: UpdateStoreInput;
    }) => updateStore(storeId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
}
