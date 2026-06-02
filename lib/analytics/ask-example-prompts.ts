import { formatMonthYearLabel } from "@/lib/utils/analytics-date-range";

export interface AnalyticsAskExampleTemplate {
  id: string;
  hint?: string;
  template: string;
}

export interface AnalyticsAskExample {
  id: string;
  hint?: string;
  prompt: string;
}

export function getAnalyticsAskDateTokens(referenceDate = new Date()) {
  const month = referenceDate.getMonth() + 1;
  const year = referenceDate.getFullYear();

  return {
    currentPeriod: formatMonthYearLabel(month, year),
    priorYearPeriod: formatMonthYearLabel(month, year - 1),
  };
}

export function buildAnalyticsAskExamples(
  templates: ReadonlyArray<AnalyticsAskExampleTemplate>,
  referenceDate = new Date(),
): AnalyticsAskExample[] {
  const tokens = getAnalyticsAskDateTokens(referenceDate);

  return templates.map(({ id, hint, template }) => ({
    id,
    hint,
    prompt: template.replace(/\{(\w+)\}/g, (_, key: string) => {
      const value = tokens[key as keyof typeof tokens];
      return value ?? `{${key}}`;
    }),
  }));
}
