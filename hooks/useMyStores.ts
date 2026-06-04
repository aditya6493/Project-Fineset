import { useQuery } from "@tanstack/react-query";
import { getMyStores } from "@/lib/api/store-portal";
import { queryOptionsForHydration } from "@/lib/sync/constants";
import type { MyStoresResponse } from "@/types";

interface UseMyStoresOptions {
  initialData?: MyStoresResponse;
}

export function useMyStores(options?: UseMyStoresOptions) {
  const isHydrated = options?.initialData !== undefined;
  return useQuery({
    queryKey: ["store", "my-stores"],
    queryFn: getMyStores,
    initialData: options?.initialData,
    staleTime: 60_000,
    ...queryOptionsForHydration(isHydrated),
  });
}
