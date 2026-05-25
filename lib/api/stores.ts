import { apiFetch, buildQueryString } from "@/lib/api/client";
import type { CreateStoreInput, UpdateStoreInput } from "@/lib/validations/store.schema";
import type { PaginatedResponse } from "@/types";
import type { Store } from "@prisma/client";

interface StoreListItem {
  id: string;
  name: string;
  city: string;
  state: string;
  pincode: string;
  isActive: boolean;
  staffCount: number;
  revenueMtd: number;
  conversionRate: number;
  createdAt: string;
}

interface GetStoresParams {
  page?: number;
  pageSize?: number;
  search?: string;
  activeOnly?: boolean;
}

export async function getStores(
  params: GetStoresParams = {},
): Promise<PaginatedResponse<StoreListItem>> {
  const qs = buildQueryString(params);
  return apiFetch<PaginatedResponse<StoreListItem>>(`/api/stores${qs}`);
}

export async function createStore(payload: CreateStoreInput): Promise<Store> {
  return apiFetch<Store>("/api/stores", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateStore(
  storeId: string,
  payload: UpdateStoreInput,
): Promise<Store> {
  return apiFetch<Store>(`/api/stores/${storeId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getStoreById(storeId: string): Promise<Store> {
  return apiFetch<Store>(`/api/stores/${storeId}`);
}
