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
    schemeEnrolled,
    followUpNeeded,
    followUpDate,
    ...visitData
  } = params;

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
        ghsEnrolled: params.ghsPolicy,
        storeId,
      },
      update: {
        name: customerPii.name,
        phone: customerPii.phone,
        area,
        gender,
        ageGroup,
        ghsEnrolled: params.ghsPolicy,
      },
    });

    const visit = await tx.visit.create({
      data: {
        ...visitData,
        customerName: customerPii.name,
        customerPhone: customerPii.phone,
        customerPhoneHash: customerPii.phoneHash,
        storeId,
        staffId,
        customerId: customer.id,
        inTime: visitData.inTime ?? new Date(),
        followUpNeeded,
        followUpDate: followUpNeeded ? followUpDate : null,
        schemeEnrolled,
        ghsPolicy: params.ghsPolicy,
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
      include: { staff: { select: { name: true } } },
    }),
    prisma.visit.count({ where }),
  ]);

  const data: VisitListItem[] = visits.map((visit) => {
    const decrypted = decryptVisitPii(visit);
    return {
      id: visit.id,
      visitDate: visit.visitDate.toISOString(),
      staffName: visit.staff.name,
      customerName: decrypted.customerName,
      customerPhone: decrypted.customerPhone,
      customerType: visit.customerType,
      visitType: visit.visitType,
      purchaseStatus: visit.purchaseStatus,
      transactionAmount: visit.transactionAmount,
      productsPurchased: visit.productsPurchased,
      productsExplored: visit.productsExplored,
      followUpNeeded: visit.followUpNeeded,
      staffNotes: visit.staffNotes,
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
