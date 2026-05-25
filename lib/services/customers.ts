import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import { decryptCustomerFields, hashPhone } from "@/lib/services/pii";

interface ListCustomersParams {
  storeId?: string;
  page: number;
  pageSize: number;
  search?: string;
}

export async function listCustomers(params: ListCustomersParams) {
  const where: Prisma.CustomerWhereInput = {};

  if (params.storeId) {
    where.storeId = params.storeId;
  }

  if (params.search) {
    const normalizedPhone = params.search.replace(/\D/g, "");
    const conditions: Prisma.CustomerWhereInput[] = [
      { name: { contains: params.search, mode: "insensitive" } },
    ];

    if (normalizedPhone.length === 10) {
      conditions.push({ phoneHash: hashPhone(normalizedPhone) });
    }

    where.OR = conditions;
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      include: {
        _count: { select: { visits: true } },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    data: customers.map((customer) => {
      const decrypted = decryptCustomerFields(customer);
      return {
        id: customer.id,
        name: decrypted.name,
        phone: decrypted.phone,
        area: customer.area,
        gender: customer.gender,
        ageGroup: customer.ageGroup,
        visitCount: customer._count.visits,
        storeId: customer.storeId,
        createdAt: customer.createdAt.toISOString(),
      };
    }),
    total,
  };
}
