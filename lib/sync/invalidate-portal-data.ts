import type { QueryClient } from "@tanstack/react-query";

/** Invalidate every portal query namespace so all dashboards refetch from the backend. */
export async function invalidatePortalData(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["visits"] }),
    queryClient.invalidateQueries({ queryKey: ["analytics"] }),
    queryClient.invalidateQueries({ queryKey: ["stores"] }),
    queryClient.invalidateQueries({ queryKey: ["staff"] }),
    queryClient.invalidateQueries({ queryKey: ["staff-calls"] }),
    queryClient.invalidateQueries({ queryKey: ["follow-ups"] }),
    queryClient.invalidateQueries({ queryKey: ["field-sales"] }),
    queryClient.invalidateQueries({ queryKey: ["portal-calls"] }),
    queryClient.invalidateQueries({ queryKey: ["sync"] }),
  ]);
}
