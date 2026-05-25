import { apiFetch, buildQueryString } from "@/lib/api/client";
import type { PaginatedResponse } from "@/types";

interface CustomerListItem {
  id: string;
  name: string;
  phone: string;
  area: string | null;
  gender: string | null;
  ageGroup: string | null;
  visitCount: number;
  storeId: string;
  createdAt: string;
}

interface GetCustomersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  storeId?: string;
}

export async function getCustomers(
  params: GetCustomersParams = {},
): Promise<PaginatedResponse<CustomerListItem>> {
  const qs = buildQueryString(params);
  return apiFetch<PaginatedResponse<CustomerListItem>>(`/api/customers${qs}`);
}
