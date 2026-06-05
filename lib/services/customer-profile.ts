import { prisma } from "@/lib/db/prisma";
import {
  decryptCustomerFields,
  decryptVisitPii,
} from "@/lib/services/pii";
import { decryptFieldSalePii } from "@/lib/services/field-sales";
import {
  customerTypesDiffer,
  deriveProfileCustomerType,
  earliestActivityDate,
  getLatestVisitCustomerType,
} from "@/lib/services/customer-profile-utils";
import type {
  BudgetRange,
  CustomerType,
  IntentTier,
  Prisma,
  PurchaseStatus,
  SourceChannel,
} from "@prisma/client";

export type CustomerTimelineEventType =
  | "visit"
  | "field_sale"
  | "follow_up"
  | "call";

export interface CustomerTimelineEvent {
  id: string;
  type: CustomerTimelineEventType;
  date: string;
  title: string;
  subtitle: string | null;
  status: string | null;
  amount: number | null;
  visitId: string | null;
  fieldSaleId: string | null;
}

export interface CustomerProfile {
  customer: {
    id: string;
    name: string;
    phone: string;
    area: string | null;
    gender: string | null;
    ageGroup: string | null;
    profession: string | null;
    customerType: CustomerType | null;
    /** Staff tag on latest visit when it differs from profile segment. */
    latestVisitCustomerType: CustomerType | null;
    ghsEnrolled: boolean;
    activeScheme: string | null;
    memberSince: string;
    lastSeenAt: string | null;
  };
  summary: {
    totalVisits: number;
    purchaseCount: number;
    totalRevenue: number;
    conversionRate: number;
    fieldSalesCount: number;
    openFollowUps: number;
    callCount: number;
  };
  interests: {
    productsExplored: string[];
    productsPurchased: string[];
    metalPreferences: string[];
    occasions: string[];
    sourceChannels: SourceChannel[];
    intentTiers: IntentTier[];
    budgetRanges: BudgetRange[];
    schemesPitched: string[];
  };
  insights: {
    competitorMentions: string[];
    noPurchaseReasons: string[];
    staffSeen: Array<{ staffId: string; staffName: string; interactions: number }>;
  };
  timeline: CustomerTimelineEvent[];
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(values.filter((v): v is string => Boolean(v?.trim()))),
  );
}

function uniqueEnum<T extends string>(values: Array<T | null | undefined>): T[] {
  return Array.from(new Set(values.filter((v): v is T => v != null)));
}

export async function resolveCustomerId(params: {
  customerId?: string;
  visitId?: string;
  storeId: string;
}): Promise<string | null> {
  if (params.customerId) {
    const exists = await prisma.customer.findFirst({
      where: { id: params.customerId, storeId: params.storeId },
      select: { id: true },
    });
    return exists?.id ?? null;
  }

  if (!params.visitId) return null;

  const visit = await prisma.visit.findFirst({
    where: { id: params.visitId, storeId: params.storeId },
    select: { customerId: true, customerPhoneHash: true, storeId: true },
  });
  if (!visit) return null;
  if (visit.customerId) return visit.customerId;

  const customer = await prisma.customer.findUnique({
    where: {
      phoneHash_storeId: {
        phoneHash: visit.customerPhoneHash,
        storeId: visit.storeId,
      },
    },
    select: { id: true },
  });
  return customer?.id ?? null;
}

const visitProfileInclude = {
  staff: { select: { id: true, name: true } },
  followUp: true,
  callLogs: {
    orderBy: { createdAt: "desc" as const },
    include: { staff: { select: { name: true } } },
  },
} as const;

const fieldSaleProfileInclude = {
  staff: { select: { id: true, name: true } },
  followUp: true,
} as const;

/** Recent events shown in profile dialog; full history via dedicated export later. */
const PROFILE_TIMELINE_LIMIT = 40;

export async function getCustomerProfile(
  customerId: string,
  storeId: string,
): Promise<CustomerProfile | null> {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, storeId },
  });

  if (!customer) return null;

  const visitWhere: Prisma.VisitWhereInput = {
    storeId,
    OR: [
      { customerId: customer.id },
      { customerPhoneHash: customer.phoneHash },
    ],
  };
  const fieldSaleWhere: Prisma.FieldSaleWhereInput = {
    storeId,
    OR: [
      { customerId: customer.id },
      { customerPhoneHash: customer.phoneHash },
    ],
  };

  const [visitRows, fieldSaleRows, visitCount, fieldSaleCount, purchaseAgg] =
    await Promise.all([
      prisma.visit.findMany({
        where: visitWhere,
        orderBy: { visitDate: "desc" },
        take: PROFILE_TIMELINE_LIMIT,
        include: visitProfileInclude,
      }),
      prisma.fieldSale.findMany({
        where: fieldSaleWhere,
        orderBy: { activityDate: "desc" },
        take: PROFILE_TIMELINE_LIMIT,
        include: fieldSaleProfileInclude,
      }),
      prisma.visit.count({ where: visitWhere }),
      prisma.fieldSale.count({ where: fieldSaleWhere }),
      prisma.visit.aggregate({
        where: { ...visitWhere, purchaseStatus: "PURCHASED" },
        _count: { id: true },
        _sum: { transactionAmount: true },
      }),
    ]);

  const decryptedCustomer = decryptCustomerFields(customer);
  type VisitRow = (typeof visitRows)[number];
  type FieldSaleRow = (typeof fieldSaleRows)[number];

  const visits: VisitRow[] = visitRows.map((visit) => {
    const decrypted = decryptVisitPii(visit);
    return {
      ...visit,
      customerName: decrypted.customerName,
      customerPhone: decrypted.customerPhone,
    };
  });
  const fieldSales: FieldSaleRow[] = fieldSaleRows.map((sale) => {
    const decrypted = decryptFieldSalePii(sale);
    return {
      ...sale,
      customerName: decrypted.customerName,
      customerPhone: decrypted.customerPhone,
    };
  });

  const purchaseCount = purchaseAgg._count.id;
  const totalRevenue = purchaseAgg._sum.transactionAmount ?? 0;
  const openFollowUps =
    visits.filter((v) => v.followUp?.status === "OPEN").length +
    fieldSales.filter((s) => s.followUp?.status === "OPEN").length;

  const latestVisit = visits[0];
  const customerType = deriveProfileCustomerType(visits);
  const latestVisitCustomerType = getLatestVisitCustomerType(visits);

  const staffMap = new Map<string, { staffId: string; staffName: string; interactions: number }>();
  for (const visit of visits) {
    const entry = staffMap.get(visit.staffId) ?? {
      staffId: visit.staffId,
      staffName: visit.staff.name,
      interactions: 0,
    };
    entry.interactions += 1;
    staffMap.set(visit.staffId, entry);
  }
  for (const sale of fieldSales) {
    const entry = staffMap.get(sale.staffId) ?? {
      staffId: sale.staffId,
      staffName: sale.staff.name,
      interactions: 0,
    };
    entry.interactions += 1;
    staffMap.set(sale.staffId, entry);
  }

  const timeline: CustomerTimelineEvent[] = [];

  for (const visit of visits) {
    timeline.push({
      id: `visit-${visit.id}`,
      type: "visit",
      date: visit.visitDate.toISOString(),
      title:
        visit.purchaseStatus === "PURCHASED"
          ? "Store visit — purchased"
          : "Store visit — no purchase",
      subtitle: `${visit.staff.name} · ${visit.visitType.replace(/_/g, " ")}`,
      status: visit.purchaseStatus,
      amount: visit.transactionAmount,
      visitId: visit.id,
      fieldSaleId: null,
    });

    if (visit.followUp) {
      timeline.push({
        id: `followup-visit-${visit.followUp.id}`,
        type: "follow_up",
        date: visit.followUp.followUpDate.toISOString(),
        title: "Follow-up scheduled",
        subtitle: visit.followUp.notes ?? visit.followUp.reason,
        status: visit.followUp.status,
        amount: null,
        visitId: visit.id,
        fieldSaleId: null,
      });
    }

    for (const call of visit.callLogs) {
      timeline.push({
        id: `call-${call.id}`,
        type: "call",
        date: call.createdAt.toISOString(),
        title:
          call.answered === "ANSWERED" ? "Retention call — answered" : "Retention call — no answer",
        subtitle: call.feedback ?? call.staff.name,
        status: call.answered,
        amount: null,
        visitId: visit.id,
        fieldSaleId: null,
      });
    }
  }

  for (const sale of fieldSales) {
    timeline.push({
      id: `fieldsale-${sale.id}`,
      type: "field_sale",
      date: sale.activityDate.toISOString(),
      title: `Field activity — ${sale.activityType.replace(/_/g, " ")}`,
      subtitle: sale.locationLabel
        ? `${sale.staff.name} · ${sale.locationLabel}`
        : sale.staff.name,
      status: sale.enrollmentOutcome,
      amount: sale.monthlyCommitment,
      visitId: null,
      fieldSaleId: sale.id,
    });

    if (sale.followUp) {
      timeline.push({
        id: `followup-fieldsale-${sale.followUp.id}`,
        type: "follow_up",
        date: sale.followUp.followUpDate.toISOString(),
        title: "Field follow-up scheduled",
        subtitle: sale.followUp.notes ?? sale.followUp.reason,
        status: sale.followUp.status,
        amount: null,
        visitId: null,
        fieldSaleId: sale.id,
      });
    }
  }

  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const callCount = visits.reduce((sum, v) => sum + v.callLogs.length, 0);
  const lastSeenAt =
    timeline[0]?.date ??
    (latestVisit?.visitDate.toISOString() ?? customer.updatedAt.toISOString());

  const memberSince = earliestActivityDate(
    [
      ...visits.map((v) => v.visitDate),
      ...fieldSales.map((s) => s.activityDate),
      customer.createdAt,
    ],
    customer.createdAt,
  ).toISOString();

  return {
    customer: {
      id: customer.id,
      name: decryptedCustomer.name,
      phone: decryptedCustomer.phone,
      area: customer.area,
      gender: customer.gender,
      ageGroup: customer.ageGroup,
      profession: customer.profession,
      customerType,
      latestVisitCustomerType: customerTypesDiffer(
        customerType,
        latestVisitCustomerType,
      )
        ? latestVisitCustomerType
        : null,
      ghsEnrolled: customer.ghsEnrolled,
      activeScheme: customer.activeScheme,
      memberSince,
      lastSeenAt,
    },
    summary: {
      totalVisits: visitCount,
      purchaseCount,
      totalRevenue,
      conversionRate:
        visitCount > 0 ? Math.round((purchaseCount / visitCount) * 100) : 0,
      fieldSalesCount: fieldSaleCount,
      openFollowUps,
      callCount,
    },
    interests: {
      productsExplored: uniqueStrings(visits.flatMap((v) => v.productsExplored)),
      productsPurchased: uniqueStrings(visits.flatMap((v) => v.productsPurchased)),
      metalPreferences: uniqueStrings(visits.map((v) => v.metalKtPref)),
      occasions: uniqueStrings(visits.map((v) => v.purchaseOccasion)),
      sourceChannels: uniqueEnum(visits.map((v) => v.sourceChannel)),
      intentTiers: uniqueEnum(visits.map((v) => v.intentTier)),
      budgetRanges: uniqueEnum(visits.map((v) => v.budgetStated)),
      schemesPitched: uniqueStrings([
        ...visits.flatMap((v) => v.schemesPitched),
        ...fieldSales.flatMap((s) => s.schemesPitched),
      ]),
    },
    insights: {
      competitorMentions: uniqueStrings([
        ...visits.map((v) => v.competitorMention),
        ...fieldSales.map((s) => s.competitorMention),
      ]),
      noPurchaseReasons: uniqueStrings(visits.map((v) => v.reasonNoPurchase)),
      staffSeen: Array.from(staffMap.values()).sort(
        (a, b) => b.interactions - a.interactions,
      ),
    },
    timeline,
  };
}
