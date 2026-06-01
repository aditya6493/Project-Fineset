import { useQuery } from "@tanstack/react-query";
import { getStoreCategoryOptions } from "@/lib/api/store-categories";
import { LIVE_QUERY_OPTIONS } from "@/lib/sync/constants";

export function useStoreCategories() {
  return useQuery({
    queryKey: ["store-category-options"],
    queryFn: getStoreCategoryOptions,
    ...LIVE_QUERY_OPTIONS,
  });
}
