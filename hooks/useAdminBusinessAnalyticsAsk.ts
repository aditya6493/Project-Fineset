import { useMutation } from "@tanstack/react-query";
import { postAdminBusinessAnalyticsAsk } from "@/lib/api/admin-business-analytics";
import type { AnalyticsAskBody } from "@/lib/validations/admin-business-analytics-ask.schema";

export function useAdminBusinessAnalyticsAsk() {
  return useMutation({
    mutationFn: (body: AnalyticsAskBody) => postAdminBusinessAnalyticsAsk(body),
  });
}
