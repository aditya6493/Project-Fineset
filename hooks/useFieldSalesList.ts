import { useQuery } from "@tanstack/react-query";
import { getFieldSalesList } from "@/lib/api/field-sales";
import { LIVE_QUERY_OPTIONS } from "@/lib/sync/constants";
import type { GetFieldSalesListParams } from "@/types";

export function useFieldSalesList(params: GetFieldSalesListParams = {}) {
  return useQuery({
    queryKey: ["field-sales", "list", params],
    queryFn: () => getFieldSalesList(params),
    ...LIVE_QUERY_OPTIONS,
  });
}
