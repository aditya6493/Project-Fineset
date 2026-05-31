"use client";

import { useAdminStoreRsoPerformance } from "@/hooks/useAnalytics";
import { RsoPerformanceView } from "@/components/analytics/RsoPerformanceView";
import type { PeriodValue } from "@/components/shared/PeriodSwitcher";
import type { Content } from "@/content/en";

type StoreRsoContent = Content["store"]["rsoPerformance"];
type PeriodLabels = Content["store"]["period"];

interface AdminRsoPerformanceSectionProps {
  storeId: string;
  copy: StoreRsoContent;
  periodLabels: PeriodLabels;
  period: PeriodValue;
  emptyMessage: string;
  errorLabel?: string;
  retryLabel?: string;
}

export function AdminRsoPerformanceSection({
  storeId,
  copy,
  periodLabels,
  period,
  emptyMessage,
  errorLabel = "Unable to load RSO performance.",
  retryLabel = "Retry",
}: AdminRsoPerformanceSectionProps) {
  const { data, isLoading, isError, refetch } = useAdminStoreRsoPerformance(storeId, {
    period,
  });
  const periodLabel = periodLabels[period];
  const title = copy.title.replace("{period}", periodLabel);

  return (
    <RsoPerformanceView
      title={title}
      subtitle={copy.subtitle}
      copy={copy}
      data={data}
      isLoading={isLoading}
      isError={isError}
      errorLabel={errorLabel ?? copy.error}
      retryLabel={retryLabel ?? copy.retry}
      onRetry={() => void refetch()}
      emptyMessage={emptyMessage}
      periodLabel={periodLabel}
    />
  );
}
