import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createStore, getStores, updateStore } from "@/lib/api/stores";
import { storesParamsMatch } from "@/lib/query/initial-data";
import { invalidatePortalData } from "@/lib/sync/invalidate-portal-data";
import { LIVE_QUERY_OPTIONS } from "@/lib/sync/constants";
import type { CreateStoreInput, UpdateStoreInput } from "@/lib/validations/store.schema";
import type { PaginatedResponse } from "@/types";

interface UseStoresParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

type StoreListResponse = PaginatedResponse<{
  id: string;
  name: string;
  category: string;
  city: string;
  state: string;
  isActive: boolean;
  staffCount: number;
  visits: number;
  revenue: number;
  conversionRate: number;
  createdAt: string;
}>;

interface UseStoresOptions {
  initialData?: StoreListResponse;
  initialParams?: UseStoresParams;
}

export function useStores(params: UseStoresParams = {}, options?: UseStoresOptions) {
  const useInitialData =
    options?.initialData &&
    options.initialParams &&
    storesParamsMatch(params, options.initialParams);

  return useQuery({
    queryKey: ["stores", params],
    queryFn: () => getStores(params),
    initialData: useInitialData ? options.initialData : undefined,
    ...LIVE_QUERY_OPTIONS,
  });
}

export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStoreInput) => createStore(payload),
    onSuccess: () => {
      void invalidatePortalData(queryClient);
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
      void invalidatePortalData(queryClient);
    },
  });
}
