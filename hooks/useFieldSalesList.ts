import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getFieldSalesList } from "@/lib/api/field-sales";
import { fieldSalesParamsMatch } from "@/lib/query/initial-data";
import { LIVE_QUERY_OPTIONS, queryOptionsForHydration } from "@/lib/sync/constants";
import type { FieldSaleListResponse, GetFieldSalesListParams } from "@/types";

interface UseFieldSalesListOptions {
  initialData?: FieldSaleListResponse;
  initialParams?: GetFieldSalesListParams;
}

export function useFieldSalesList(
  params: GetFieldSalesListParams = {},
  options?: UseFieldSalesListOptions,
) {
  const useInitialData =
    options?.initialData &&
    options.initialParams &&
    fieldSalesParamsMatch(params, options.initialParams);

  return useQuery({
    queryKey: ["field-sales", "list", params],
    queryFn: () => getFieldSalesList(params),
    initialData: useInitialData ? options.initialData : undefined,
    placeholderData: keepPreviousData,
    ...LIVE_QUERY_OPTIONS,
    ...queryOptionsForHydration(Boolean(useInitialData)),
  });
}
