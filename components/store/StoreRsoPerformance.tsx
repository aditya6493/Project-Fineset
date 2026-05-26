"use client";

import { useStoreRsoPerformance } from "@/hooks/useRsoPerformance";
import { RsoPerformanceView } from "@/components/analytics/RsoPerformanceView";
import type { PeriodValue } from "@/components/shared/PeriodSwitcher";
import type { Content } from "@/content/en";

type StoreRsoContent = Content["store"]["rsoPerformance"];
type PeriodLabels = Content["store"]["period"];

interface StoreRsoPerformanceSectionProps {
  copy: StoreRsoContent;
  periodLabels: PeriodLabels;
  period: PeriodValue;
  emptyMessage: string;
  errorLabel?: string;
  retryLabel?: string;
}

export function StoreRsoPerformanceSection({
  copy,
  periodLabels,
  period,
  emptyMessage,
  errorLabel = "Unable to load RSO performance.",
  retryLabel = "Retry",
}: StoreRsoPerformanceSectionProps) {
  const { data, isLoading, isError, refetch } = useStoreRsoPerformance({ period });
  const periodLabel = periodLabels[period];
  const title = copy.title.replace("{period}", periodLabel);

  return (
    <RsoPerformanceView
      title={title}
      copy={copy}
      data={data}
      isLoading={isLoading}
      isError={isError}
      errorLabel={errorLabel}
      retryLabel={retryLabel}
      onRetry={() => void refetch()}
      emptyMessage={emptyMessage}
    />
  );
}
