import { prisma } from "@/lib/db/prisma";
import type { CreateVisitInput } from "@/lib/validations/visit.schema";
import type { VisitListItem } from "@/types";
import type { Prisma, Visit } from "@prisma/client";
import {
  decryptCustomerFields,
  decryptVisitPii,
  hashPhone,
  prepareCustomerPii,
} from "@/lib/services/pii";
import { calculateDurationMins } from "@/lib/utils/formatters";
import { resolveSchemeEnrollmentFlags } from "@/lib/services/scheme-enrollment";

interface CreateVisitParams extends CreateVisitInput {
  storeId: string;
  staffId: string;
}

export async function createVisit(params: CreateVisitParams): Promise<Visit> {
  const {
    storeId,
    staffId,
    customerName,
    customerPhone,
    area,
    gender,
    ageGroup,
    followUpNeeded,
    followUpDate,
    purchaseStatus,
    enrollmentOutcome,
    ...visitData
  } = params;

  if (!purchaseStatus) {
    throw new Error("Purchase status is required");
  }

  const schemeFlags = resolveSchemeEnrollmentFlags(enrollmentOutcome);
  const customerPii = prepareCustomerPii(customerName, customerPhone);

  return prisma.$transaction(async (tx) => {
    const customer = await tx.customer.upsert({
      where: {
        phoneHash_storeId: {
          phoneHash: customerPii.phoneHash,
          storeId,
        },
      },
      create: {
        ...customerPii,
        area,
        gender,
        ageGroup,
        ghsEnrolled: schemeFlags.ghsPolicy,
        activeScheme: schemeFlags.activeScheme,
        storeId,
      },
      update: {
        name: customerPii.name,
        phone: customerPii.phone,
        area,
        gender,
        ageGroup,
        ...(schemeFlags.ghsPolicy ? { ghsEnrolled: true } : {}),
        ...(schemeFlags.activeScheme ? { activeScheme: schemeFlags.activeScheme } : {}),
      },
    });

    const inTime = visitData.inTime ?? new Date();
    const outTime = visitData.outTime ?? null;
    const durationMins =
      outTime !== null ? calculateDurationMins(inTime, outTime) : null;

    const visit = await tx.visit.create({
      data: {
        ...visitData,
        purchaseStatus,
        customerName: customerPii.name,
        customerPhone: customerPii.phone,
        customerPhoneHash: customerPii.phoneHash,
        area,
        gender,
        ageGroup,
        storeId,
        staffId,
        customerId: customer.id,
        inTime,
        outTime,
        durationMins,
        followUpNeeded,
        followUpDate: followUpNeeded ? followUpDate : null,
        enrollmentOutcome,
        schemeEnrolled: schemeFlags.schemeEnrolled,
        ghsPolicy: schemeFlags.ghsPolicy,
      },
    });

    if (followUpNeeded && followUpDate) {
      await tx.followUp.create({
        data: {
          visitId: visit.id,
          assignedStaffId: staffId,
          followUpDate,
          reason: visitData.reasonNoPurchase ?? "Follow-up requested",
          status: "OPEN",
        },
      });
    }

    return decryptVisitPii(visit);
  });
}

interface ListVisitsParams {
  storeId?: string;
  page: number;
  pageSize: number;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy: string;
  sortOrder: "asc" | "desc";
  followUpOnly?: boolean;
}

export async function listVisits(
  params: ListVisitsParams,
): Promise<{ data: VisitListItem[]; total: number }> {
  const where: Prisma.VisitWhereInput = {};

  if (params.storeId) {
    where.storeId = params.storeId;
  }

  if (params.startDate || params.endDate) {
    where.visitDate = {};
    if (params.startDate) where.visitDate.gte = params.startDate;
    if (params.endDate) where.visitDate.lte = params.endDate;
  }

  if (params.followUpOnly) {
    where.followUpNeeded = true;
  }

  if (params.search) {
    const normalizedPhone = params.search.replace(/\D/g, "");
    const searchConditions: Prisma.VisitWhereInput[] = [
      { staff: { name: { contains: params.search, mode: "insensitive" } } },
    ];

    if (normalizedPhone.length === 10) {
      searchConditions.push({
        customerPhoneHash: hashPhone(normalizedPhone),
      });
    }

    searchConditions.push({
      customerName: { contains: params.search, mode: "insensitive" },
    });

    where.OR = searchConditions;
  }

  const orderBy: Prisma.VisitOrderByWithRelationInput = {
    [params.sortBy]: params.sortOrder,
  };

  const [visits, total] = await Promise.all([
    prisma.visit.findMany({
      where,
      orderBy,
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      include: {
        staff: { select: { name: true } },
        customer: { select: { area: true, gender: true, ageGroup: true } },
        followUp: { select: { status: true } },
      },
    }),
    prisma.visit.count({ where }),
  ]);

  const data: VisitListItem[] = visits.map((visit) => {
    const decrypted = decryptVisitPii(visit);
    return {
      id: visit.id,
      visitDate: visit.visitDate.toISOString(),
      inTime: visit.inTime?.toISOString() ?? null,
      outTime: visit.outTime?.toISOString() ?? null,
      durationMins: visit.durationMins,
      staffName: visit.staff.name,
      customerName: decrypted.customerName,
      customerPhone: decrypted.customerPhone,
      customerType: visit.customerType,
      visitType: visit.visitType,
      sourceChannel: visit.sourceChannel,
      area: visit.area ?? visit.customer?.area ?? null,
      gender: visit.gender ?? visit.customer?.gender ?? null,
      ageGroup: visit.ageGroup ?? visit.customer?.ageGroup ?? null,
      purchaseStatus: visit.purchaseStatus,
      productsExplored: visit.productsExplored,
      productsPurchased: visit.productsPurchased,
      transactionAmount: visit.transactionAmount,
      intentTier: visit.intentTier,
      reasonNoPurchase: visit.reasonNoPurchase,
      competitorMention: visit.competitorMention,
      purchaseOccasion: visit.purchaseOccasion,
      metalKtPref: visit.metalKtPref,
      budgetStated: visit.budgetStated,
      schemeEnrolled: visit.schemeEnrolled,
      ghsPolicy: visit.ghsPolicy,
      followUpNeeded: visit.followUpNeeded,
      followUpDate: visit.followUpDate?.toISOString() ?? null,
      staffNotes: visit.staffNotes,
      followUpStatus: visit.followUp?.status ?? null,
    };
  });

  return { data, total };
}

export async function getVisitById(
  id: string,
  storeId?: string,
): Promise<
  | (Prisma.VisitGetPayload<{
      include: {
        staff: { select: { name: true; id: true } };
        followUp: true;
        customer: true;
      };
    }> & {
      customer: ReturnType<typeof decryptCustomerFields> | null;
    })
  | null
> {
  const visit = await prisma.visit.findFirst({
    where: {
      id,
      ...(storeId ? { storeId } : {}),
    },
    include: {
      staff: { select: { name: true, id: true } },
      followUp: true,
      customer: true,
    },
  });

  if (!visit) return null;

  const decryptedVisit = decryptVisitPii(visit);
  return {
    ...visit,
    ...decryptedVisit,
    customer: visit.customer
      ? decryptCustomerFields(visit.customer)
      : null,
  };
}
