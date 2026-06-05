import { useQuery } from "@tanstack/react-query";
import { getCustomerProfile } from "@/lib/api/customers";
import { LIVE_QUERY_OPTIONS } from "@/lib/sync/constants";

interface UseCustomerProfileParams {
  customerId?: string | null;
  visitId?: string | null;
  enabled?: boolean;
}

export function useCustomerProfile({
  customerId,
  visitId,
  enabled = true,
}: UseCustomerProfileParams) {
  const canFetch = enabled && Boolean(customerId || visitId);

  return useQuery({
    queryKey: ["customer-profile", customerId ?? null, visitId ?? null],
    queryFn: () =>
      getCustomerProfile({
        customerId: customerId ?? undefined,
        visitId: visitId ?? undefined,
      }),
    enabled: canFetch,
    ...LIVE_QUERY_OPTIONS,
  });
}
