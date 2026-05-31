import { prisma } from "@/lib/db/prisma";
import type { CreateFieldSaleInput } from "@/lib/validations/field-sale.schema";
import type { FieldSale, Prisma } from "@prisma/client";
import { resolveSchemeEnrollmentFlags } from "@/lib/services/scheme-enrollment";
import { broadcastSyncEvent } from "@/lib/sync/broadcaster";
import {
  decryptVisitPii,
  prepareCustomerPii,
} from "@/lib/services/pii";
import { calculateDurationMins, formatDate } from "@/lib/utils/formatters";
import { hashPhone } from "@/lib/services/pii";

interface CreateFieldSaleParams extends CreateFieldSaleInput {
  storeId: string;
  staffId: string;
}

export async function createFieldSale(
  params: CreateFieldSaleParams,
): Promise<FieldSale> {
  const {
    storeId,
    staffId,
    customerName,
    customerPhone,
    area,
    gender,
    ageGroup,
    profession,
    activityDate,
    startTime,
    endTime,
    followUpNeeded,
    followUpDate,
    enrollmentOutcome: _enrollmentOutcome,
    ...fieldData
  } = params;

  const enrollmentOutcome = params.enrollmentOutcome ?? null;

  const customerPii = prepareCustomerPii(customerName, customerPhone);
  const enrollmentFlags = resolveSchemeEnrollmentFlags(enrollmentOutcome);
  const resolvedStart = startTime ?? new Date();
  const resolvedEnd = endTime ?? null;
  const durationMins =
    resolvedEnd !== null
      ? calculateDurationMins(resolvedStart, resolvedEnd)
      : null;

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
        profession,
        ghsEnrolled: enrollmentFlags.ghsPolicy,
        activeScheme: enrollmentFlags.activeScheme,
        storeId,
      },
      update: {
        name: customerPii.name,
        phone: customerPii.phone,
        area,
        gender,
        ageGroup,
        profession,
        ...(enrollmentFlags.ghsPolicy ? { ghsEnrolled: true } : {}),
        ...(enrollmentFlags.activeScheme
          ? { activeScheme: enrollmentFlags.activeScheme }
          : {}),
      },
    });

    const fieldSale = await tx.fieldSale.create({
      data: {
        ...fieldData,
        enrollmentOutcome: enrollmentOutcome ?? undefined,
        activityDate: activityDate ?? new Date(),
        startTime: resolvedStart,
        endTime: resolvedEnd,
        durationMins,
        storeId,
        staffId,
        customerId: customer.id,
        customerName: customerPii.name,
        customerPhone: customerPii.phone,
        customerPhoneHash: customerPii.phoneHash,
        area,
        gender,
        ageGroup,
        profession,
        followUpNeeded,
        followUpDate: followUpNeeded ? followUpDate : null,
      },
    });

    if (followUpNeeded && followUpDate) {
      await tx.followUp.create({
        data: {
          fieldSaleId: fieldSale.id,
          assignedStaffId: staffId,
          followUpDate,
          reason: "Field activity follow-up",
          status: "OPEN",
        },
      });
    }

    return decryptFieldSalePii(fieldSale);
  }).then((fieldSale) => {
    broadcastSyncEvent(storeId, ["fieldSales", "customers", "followUps"]);
    return fieldSale;
  });
}

export function decryptFieldSalePii<T extends { customerName: string; customerPhone: string }>(
  record: T,
): T {
  return decryptVisitPii(record);
}

interface ListFieldSalesParams {
  storeId?: string;
  staffId?: string;
  page: number;
  pageSize: number;
  year: number;
  month: number;
  search?: string;
  enrollmentOutcome?: CreateFieldSaleInput["enrollmentOutcome"];
  activityType?: CreateFieldSaleInput["activityType"];
}

function monthRange(year: number, month: number) {
  return {
    gte: new Date(year, month - 1, 1),
    lt: new Date(year, month, 1),
  };
}

function buildFieldSaleWhere(params: ListFieldSalesParams): Prisma.FieldSaleWhereInput {
  const where: Prisma.FieldSaleWhereInput = {
    activityDate: monthRange(params.year, params.month),
  };

  if (params.storeId) where.storeId = params.storeId;
  if (params.staffId) where.staffId = params.staffId;
  if (params.enrollmentOutcome) where.enrollmentOutcome = params.enrollmentOutcome;
  if (params.activityType) where.activityType = params.activityType;

  if (params.search?.trim()) {
    const normalizedPhone = params.search.replace(/\D/g, "");
    const searchConditions: Prisma.FieldSaleWhereInput[] = [
      { staff: { name: { contains: params.search, mode: "insensitive" } } },
      { customerName: { contains: params.search, mode: "insensitive" } },
    ];

    if (normalizedPhone.length === 10) {
      searchConditions.push({
        customerPhoneHash: hashPhone(normalizedPhone),
      });
    }

    where.AND = [{ OR: searchConditions }];
  }

  return where;
}

async function countFieldSaleMonths(
  params: Pick<ListFieldSalesParams, "storeId" | "staffId" | "year" | "search" | "enrollmentOutcome">,
) {
  const counts = await Promise.all(
    Array.from({ length: 12 }, async (_, index) => {
      const month = index + 1;
      const count = await prisma.fieldSale.count({
        where: buildFieldSaleWhere({ ...params, month, page: 1, pageSize: 1 }),
      });
      return { month, count };
    }),
  );

  return counts;
}

export async function listFieldSales(params: ListFieldSalesParams) {
  const where = buildFieldSaleWhere(params);

  const [records, total, months, yearRecords] = await Promise.all([
    prisma.fieldSale.findMany({
      where,
      orderBy: { activityDate: "desc" },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      include: {
        staff: { select: { id: true, name: true } },
        store: { select: { id: true, name: true } },
      },
    }),
    prisma.fieldSale.count({ where }),
    countFieldSaleMonths(params),
    prisma.fieldSale.findMany({
      where: {
        ...(params.storeId ? { storeId: params.storeId } : {}),
        ...(params.staffId ? { staffId: params.staffId } : {}),
        activityDate: {
          gte: new Date(params.year, 0, 1),
          lt: new Date(params.year + 1, 0, 1),
        },
      },
      select: { activityDate: true },
    }),
  ]);

  const availableYears = Array.from(
    new Set([
      ...yearRecords.map((record) => record.activityDate.getFullYear()),
      new Date().getFullYear(),
    ]),
  ).sort((a, b) => b - a);

  return {
    data: records.map((record) => {
      const decrypted = decryptFieldSalePii(record);
      return {
        id: record.id,
        activityDate: record.activityDate.toISOString(),
        activityDateLabel: formatDate(record.activityDate),
        staffId: record.staff.id,
        staffName: record.staff.name,
        storeId: record.store.id,
        storeName: record.store.name,
        customerName: decrypted.customerName,
        customerPhone: decrypted.customerPhone,
        customerType: record.customerType,
        activityType: record.activityType,
        locationLabel: record.locationLabel,
        schemesPitched: record.schemesPitched,
        enrollmentOutcome: record.enrollmentOutcome,
        monthlyCommitment: record.monthlyCommitment,
        intentTier: record.intentTier,
        reasonNoEnrollment: record.reasonNoEnrollment,
        followUpNeeded: record.followUpNeeded,
        followUpDate: record.followUpDate?.toISOString() ?? null,
        staffNotes: record.staffNotes,
      };
    }),
    total,
    page: params.page,
    pageSize: params.pageSize,
    year: params.year,
    month: params.month,
    filters: {
      months,
      availableYears,
    },
  };
}
