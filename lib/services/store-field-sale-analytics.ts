import { prisma } from "@/lib/db/prisma";
import { buildFieldNotesInsights } from "@/lib/services/field-notes-insights";
import {
  calculateFieldEnrollmentPercent,
  isFieldSaleEnrolled,
} from "@/lib/utils/field-enrollment";
import {
  calculateDelta,
  formatDateKey,
  getPeriodRange,
  getPreviousPeriodRange,
} from "@/lib/utils/analytics";
import { formatPercent } from "@/lib/utils/formatters";
import type { AnalyticsPeriod, StoreFieldSaleAnalytics } from "@/types";
import type {
  CustomerType,
  FieldActivityType,
  FieldDeclineReason,
  FollowUpStatus,
  IntentTier,
  SchemeEnrollmentOutcome,
} from "@prisma/client";

type PeriodLabel = AnalyticsPeriod["label"];

interface FieldSaleRow {
  id: string;
  activityDate: Date;
  staffId: string;
  area: string | null;
  locationLabel: string | null;
  activityType: FieldActivityType;
  enrollmentOutcome: SchemeEnrollmentOutcome | null;
  intentTier: IntentTier | null;
  reasonNoEnrollment: FieldDeclineReason | null;
  followUpNeeded: boolean;
  customerType: CustomerType;
  staffNotes: string | null;
  staff: { name: string };
  followUp: { status: FollowUpStatus } | null;
}

const ACTIVITY_TYPE_LABELS: Record<FieldActivityType, string> = {
  DOOR_TO_DOOR: "Door to door",
  HOUSING_SOCIETY: "Housing society",
  CORPORATE: "Corporate",
  EVENT_EXHIBITION: "Event / exhibition",
  MARKET_STALL: "Market stall",
  REFERRAL_MEET: "Referral meet",
  OTHER: "Other",
};

const OUTCOME_LABELS: Record<SchemeEnrollmentOutcome, string> = {
  ENROLLED_GHS: "Enrolled GHS",
  ENROLLED_GPP: "Enrolled GPP",
  ENROLLED_BOTH: "Enrolled both",
  INTERESTED: "Interested",
  DECLINED: "Declined",
  CALLBACK: "Callback",
};

const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  NEW: "New",
  REPEAT: "Repeat",
  VIP: "VIP",
};

const INTENT_LABELS: Record<IntentTier, string> = {
  HOT: "Hot intent",
  WARM: "Warm intent",
  COLD: "Cold intent",
  BROWSING: "Browsing",
};

const DECLINE_LABELS: Record<FieldDeclineReason, string> = {
  BUDGET: "Budget",
  ALREADY_ENROLLED: "Already enrolled",
  NOT_INTERESTED: "Not interested",
  NEEDS_TIME: "Needs time",
  TRUST_CONCERNS: "Trust concerns",
  COMPETITOR_SCHEME: "Competitor scheme",
};

const FOLLOW_UP_STATUS_LABELS: Record<FollowUpStatus, string> = {
  OPEN: "Open",
  CLOSED: "Closed",
  CONVERTED: "Converted",
  NO_RESPONSE: "No response",
};

const fieldSaleSelect = {
  id: true,
  activityDate: true,
  staffId: true,
  area: true,
  locationLabel: true,
  activityType: true,
  enrollmentOutcome: true,
  intentTier: true,
  reasonNoEnrollment: true,
  followUpNeeded: true,
  customerType: true,
  staffNotes: true,
  staff: { select: { name: true } },
  followUp: { select: { status: true } },
} as const;

function resolveAreaLabel(row: FieldSaleRow): string {
  const label = row.area?.trim() || row.locationLabel?.trim();
  return label && label.length > 0 ? label : "Unspecified area";
}

async function fetchFieldSalesForStore(
  storeId: string,
  start: Date,
  end: Date,
): Promise<FieldSaleRow[]> {
  return prisma.fieldSale.findMany({
    where: {
      storeId,
      activityDate: { gte: start, lte: end },
    },
    select: fieldSaleSelect,
    orderBy: { activityDate: "asc" },
  });
}

interface PeriodMetrics {
  summary: StoreFieldSaleAnalytics["summary"];
  staffBreakdown: StoreFieldSaleAnalytics["staffBreakdown"];
  dailyTrend: StoreFieldSaleAnalytics["dailyTrend"];
  byActivityType: StoreFieldSaleAnalytics["byActivityType"];
  byEnrollmentOutcome: StoreFieldSaleAnalytics["byEnrollmentOutcome"];
  byCustomerType: StoreFieldSaleAnalytics["byCustomerType"];
  byIntentTier: StoreFieldSaleAnalytics["byIntentTier"];
  byDeclineReason: StoreFieldSaleAnalytics["byDeclineReason"];
  byArea: StoreFieldSaleAnalytics["byArea"];
  followUpStatus: StoreFieldSaleAnalytics["followUpStatus"];
  notesInsights: StoreFieldSaleAnalytics["notesInsights"];
  highlights: StoreFieldSaleAnalytics["highlights"];
}

function buildBreakdown(
  rows: FieldSaleRow[],
  getKey: (row: FieldSaleRow) => string | null,
  labels: Record<string, string>,
): StoreFieldSaleAnalytics["byActivityType"] {
  const map = new Map<
    string,
    { label: string; total: number; enrolled: number; followUpNeeded: number }
  >();

  for (const row of rows) {
    const key = getKey(row);
    if (!key) continue;
    const label = labels[key] ?? key;
    const entry = map.get(key) ?? { label, total: 0, enrolled: 0, followUpNeeded: 0 };
    entry.total += 1;
    if (isFieldSaleEnrolled(row.enrollmentOutcome)) entry.enrolled += 1;
    if (row.followUpNeeded) entry.followUpNeeded += 1;
    map.set(key, entry);
  }

  return [...map.values()]
    .map((r) => ({
      label: r.label,
      total: r.total,
      enrolled: r.enrolled,
      followUpNeeded: r.followUpNeeded,
      enrollmentRatePercent: calculateFieldEnrollmentPercent(r.enrolled, r.total),
    }))
    .sort((a, b) => b.total - a.total);
}

function aggregatePeriodMetrics(
  rows: FieldSaleRow[],
  notesInsights: StoreFieldSaleAnalytics["notesInsights"],
): PeriodMetrics {
  const enrolledRows = rows.filter((r) => isFieldSaleEnrolled(r.enrollmentOutcome));
  const followUpRows = rows.filter((r) => r.followUpNeeded);

  const uniqueAreas = new Set(rows.map(resolveAreaLabel));

  const staffMap = new Map<
    string,
    {
      staffName: string;
      totalVisits: number;
      enrolled: number;
      followUpNeeded: number;
      followUpsConverted: number;
      areas: Set<string>;
      withNotes: number;
    }
  >();

  for (const row of rows) {
    const entry =
      staffMap.get(row.staffId) ??
      {
        staffName: row.staff.name,
        totalVisits: 0,
        enrolled: 0,
        followUpNeeded: 0,
        followUpsConverted: 0,
        areas: new Set<string>(),
        withNotes: 0,
      };
    entry.totalVisits += 1;
    if (isFieldSaleEnrolled(row.enrollmentOutcome)) {
      entry.enrolled += 1;
    }
    if (row.followUpNeeded) entry.followUpNeeded += 1;
    if (row.followUp?.status === "CONVERTED") entry.followUpsConverted += 1;
    if (row.staffNotes?.trim()) entry.withNotes += 1;
    entry.areas.add(resolveAreaLabel(row));
    staffMap.set(row.staffId, entry);
  }

  const staffBreakdown = [...staffMap.entries()]
    .map(([staffId, s]) => ({
      staffId,
      staffName: s.staffName,
      totalVisits: s.totalVisits,
      enrolled: s.enrolled,
      enrollmentRatePercent: calculateFieldEnrollmentPercent(s.enrolled, s.totalVisits),
      followUpNeeded: s.followUpNeeded,
      followUpsConverted: s.followUpsConverted,
      uniqueAreas: s.areas.size,
      visitsWithNotes: s.withNotes,
    }))
    .sort((a, b) => b.totalVisits - a.totalVisits);

  const dailyMap = new Map<
    string,
    { total: number; enrolled: number; followUpNeeded: number; interested: number; declined: number }
  >();
  for (const row of rows) {
    const key = formatDateKey(row.activityDate);
    const day = dailyMap.get(key) ?? {
      total: 0,
      enrolled: 0,
      followUpNeeded: 0,
      interested: 0,
      declined: 0,
    };
    day.total += 1;
    if (isFieldSaleEnrolled(row.enrollmentOutcome)) day.enrolled += 1;
    if (row.followUpNeeded) day.followUpNeeded += 1;
    if (row.enrollmentOutcome === "INTERESTED" || row.enrollmentOutcome === "CALLBACK") {
      day.interested += 1;
    }
    if (row.enrollmentOutcome === "DECLINED") day.declined += 1;
    dailyMap.set(key, day);
  }

  const dailyTrend = [...dailyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, d]) => ({
      date,
      total: d.total,
      enrolled: d.enrolled,
      followUpNeeded: d.followUpNeeded,
      interested: d.interested,
      declined: d.declined,
      enrollmentRatePercent: calculateFieldEnrollmentPercent(d.enrolled, d.total),
    }));

  const byActivityType = buildBreakdown(
    rows,
    (r) => r.activityType,
    ACTIVITY_TYPE_LABELS,
  );

  const byEnrollmentOutcome = buildBreakdown(
    rows.filter((r) => r.enrollmentOutcome != null),
    (r) => r.enrollmentOutcome,
    OUTCOME_LABELS,
  );

  const byCustomerType = buildBreakdown(
    rows,
    (r) => r.customerType,
    CUSTOMER_TYPE_LABELS,
  );

  const byIntentTier = buildBreakdown(
    rows.filter((r) => r.intentTier != null),
    (r) => r.intentTier,
    INTENT_LABELS,
  );

  const byDeclineReason = buildBreakdown(
    rows.filter((r) => r.reasonNoEnrollment != null),
    (r) => r.reasonNoEnrollment,
    DECLINE_LABELS,
  );

  const areaMap = new Map<
    string,
    { label: string; total: number; enrolled: number; followUpNeeded: number }
  >();
  for (const row of rows) {
    const label = resolveAreaLabel(row);
    const entry = areaMap.get(label) ?? {
      label,
      total: 0,
      enrolled: 0,
      followUpNeeded: 0,
    };
    entry.total += 1;
    if (isFieldSaleEnrolled(row.enrollmentOutcome)) entry.enrolled += 1;
    if (row.followUpNeeded) entry.followUpNeeded += 1;
    areaMap.set(label, entry);
  }
  const byArea = [...areaMap.values()]
    .map((r) => ({
      label: r.label,
      total: r.total,
      enrolled: r.enrolled,
      followUpNeeded: r.followUpNeeded,
      enrollmentRatePercent: calculateFieldEnrollmentPercent(r.enrolled, r.total),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 12);

  const followUpStatusMap = new Map<FollowUpStatus, number>();
  for (const row of rows) {
    if (!row.followUpNeeded && !row.followUp) continue;
    const status = row.followUp?.status ?? "OPEN";
    followUpStatusMap.set(status, (followUpStatusMap.get(status) ?? 0) + 1);
  }
  const followUpStatus = [...followUpStatusMap.entries()]
    .map(([status, count]) => ({
      label: FOLLOW_UP_STATUS_LABELS[status],
      status,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const staffWithVisits = staffBreakdown.filter((s) => s.totalVisits >= 3);
  const bestEnrollmentRate =
    staffWithVisits.length > 0
      ? staffWithVisits.reduce((best, row) =>
          row.enrollmentRatePercent > best.enrollmentRatePercent ? row : best,
        )
      : null;

  const needsAttention = staffBreakdown
    .filter((s) => s.totalVisits >= 3 && s.enrollmentRatePercent < 20)
    .slice(0, 3);

  const convertedFollowUps = rows.filter((r) => r.followUp?.status === "CONVERTED").length;

  return {
    summary: {
      totalVisits: rows.length,
      uniqueAreas: uniqueAreas.size,
      enrolled: enrolledRows.length,
      enrollmentRatePercent: calculateFieldEnrollmentPercent(enrolledRows.length, rows.length),
      interested: rows.filter(
        (r) => r.enrollmentOutcome === "INTERESTED" || r.enrollmentOutcome === "CALLBACK",
      ).length,
      declined: rows.filter((r) => r.enrollmentOutcome === "DECLINED").length,
      followUpRequired: followUpRows.length,
      convertedFollowUps,
      followUpConversionPercent: calculateFieldEnrollmentPercent(
        convertedFollowUps,
        followUpRows.length,
      ),
    },
    staffBreakdown,
    dailyTrend,
    byActivityType,
    byEnrollmentOutcome,
    byCustomerType,
    byIntentTier,
    byDeclineReason,
    byArea,
    followUpStatus,
    notesInsights,
    highlights: {
      bestEnrollmentRate: bestEnrollmentRate
        ? {
            staffId: bestEnrollmentRate.staffId,
            staffName: bestEnrollmentRate.staffName,
            enrollmentRatePercent: bestEnrollmentRate.enrollmentRatePercent,
            enrollmentRateLabel: formatPercent(bestEnrollmentRate.enrollmentRatePercent),
          }
        : null,
      needsAttention: needsAttention.map((s) => ({
        staffId: s.staffId,
        staffName: s.staffName,
        enrollmentRatePercent: s.enrollmentRatePercent,
      })),
    },
  };
}

export async function getStoreFieldSaleAnalytics(
  storeId: string,
  period: PeriodLabel,
  referenceDate: Date = new Date(),
): Promise<StoreFieldSaleAnalytics> {
  const { start, end } = getPeriodRange(period, referenceDate);
  const previous = getPreviousPeriodRange(period, referenceDate);

  const [rows, previousRows] = await Promise.all([
    fetchFieldSalesForStore(storeId, start, end),
    fetchFieldSalesForStore(storeId, previous.start, previous.end),
  ]);

  const noteSnippets = rows
    .map((r) => r.staffNotes?.trim())
    .filter((s): s is string => Boolean(s));

  const notesInsights = await buildFieldNotesInsights({ noteSnippets });

  const current = aggregatePeriodMetrics(rows, notesInsights);
  const prevMetrics = aggregatePeriodMetrics(previousRows, {
    themes: [],
    recentSnippets: [],
    aiSummary: null,
    aiSummaryAvailable: notesInsights.aiSummaryAvailable,
  });

  return {
    period,
    periodRange: { start: start.toISOString(), end: end.toISOString() },
    ...current,
    deltas: {
      totalVisits: calculateDelta(current.summary.totalVisits, prevMetrics.summary.totalVisits),
      enrolled: calculateDelta(current.summary.enrolled, prevMetrics.summary.enrolled),
      enrollmentRatePercent: calculateDelta(
        current.summary.enrollmentRatePercent,
        prevMetrics.summary.enrollmentRatePercent,
      ),
      followUpRequired: calculateDelta(
        current.summary.followUpRequired,
        prevMetrics.summary.followUpRequired,
      ),
      followUpConversionPercent: calculateDelta(
        current.summary.followUpConversionPercent,
        prevMetrics.summary.followUpConversionPercent,
      ),
    },
  };
}
