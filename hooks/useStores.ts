import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createStore, deleteStore, getStores, updateStore } from "@/lib/api/stores";
import { storesParamsMatch } from "@/lib/query/initial-data";
import { invalidatePortalData } from "@/lib/sync/invalidate-portal-data";
import { LIVE_QUERY_OPTIONS, queryOptionsForHydration } from "@/lib/sync/constants";
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
  customCategory?: string | null;
  city: string;
  state: string;
  pincode?: string | null;
  pocName?: string | null;
  pointOfContactPhone?: string | null;
  email?: string | null;
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
  // #region agent log
  fetch('http://127.0.0.1:7770/ingest/e9d9530f-db18-41c5-908e-df9613ae6f7e',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ea2429'},body:JSON.stringify({sessionId:'ea2429',runId:'build-debug',hypothesisId:'C',location:'hooks/useStores.ts:useStores:entry',message:'useStores initialData shape',data:{hasInitialData:Boolean(options?.initialData),firstKeys:options?.initialData?.data?.[0]?Object.keys(options.initialData.data[0]):[],hasRevenueField:Boolean(options?.initialData?.data?.[0] && Object.prototype.hasOwnProperty.call(options.initialData.data[0],'revenue')),hasConversionRateField:Boolean(options?.initialData?.data?.[0] && Object.prototype.hasOwnProperty.call(options.initialData.data[0],'conversionRate'))},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  const useInitialData =
    options?.initialData &&
    options.initialParams &&
    storesParamsMatch(params, options.initialParams);

  return useQuery({
    queryKey: ["stores", params],
    queryFn: () => getStores(params),
    initialData: useInitialData ? options.initialData : undefined,
    ...LIVE_QUERY_OPTIONS,
    ...queryOptionsForHydration(Boolean(useInitialData)),
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

export function useDeleteStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storeId: string) => deleteStore(storeId),
    onSuccess: () => {
      void invalidatePortalData(queryClient);
    },
  });
}
