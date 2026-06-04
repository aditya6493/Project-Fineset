import { apiFetch, buildQueryString } from "@/lib/api/client";
import type { CreateStoreInput, UpdateStoreInput } from "@/lib/validations/store.schema";
import type { PaginatedResponse, StoreCategory } from "@/types";
import type { CreateStoreResult } from "@/lib/services/stores";
import type { Store } from "@prisma/client";

interface StoreListItem {
  id: string;
  name: string;
  category: StoreCategory;
  customCategory: string | null;
  city: string;
  state: string;
  pincode: string | null;
  pocName: string | null;
  pointOfContactPhone: string | null;
  email: string | null;
  isActive: boolean;
  deletedAt?: string | null;
  purgeAt?: string | null;
  staffCount: number;
  visits: number;
  revenue: number;
  conversionRate: number;
  createdAt: string;
}

interface GetStoresParams {
  page?: number;
  pageSize?: number;
  search?: string;
  activeOnly?: boolean;
  includeDeleted?: boolean;
}

export async function getStores(
  params: GetStoresParams = {},
): Promise<PaginatedResponse<StoreListItem>> {
  const qs = buildQueryString(params);
  return apiFetch<PaginatedResponse<StoreListItem>>(`/api/stores${qs}`);
}

export async function getManagerLoginStatus(
  email: string,
): Promise<{ hasExistingLogin: boolean }> {
  const qs = buildQueryString({ email: email.trim().toLowerCase() });
  return apiFetch<{ hasExistingLogin: boolean }>(
    `/api/stores/manager-login-status${qs}`,
  );
}

export async function createStore(payload: CreateStoreInput): Promise<CreateStoreResult> {
  return apiFetch<CreateStoreResult>("/api/stores", {
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

export interface SoftDeleteStorePayload {
  password: string;
  storeNameConfirm: string;
}

export interface SoftDeleteStoreResponse {
  id: string;
  name: string;
  deletedAt: string;
  purgeAt: string;
}

export async function deleteStore(
  storeId: string,
  payload: SoftDeleteStorePayload,
): Promise<SoftDeleteStoreResponse> {
  return apiFetch<SoftDeleteStoreResponse>(`/api/stores/${storeId}`, {
    method: "DELETE",
    body: JSON.stringify(payload),
  });
}

export async function restoreStore(storeId: string): Promise<Store> {
  return apiFetch<Store>(`/api/stores/${storeId}/restore`, {
    method: "POST",
  });
}

export async function updateStoreManagerPassword(
  storeId: string,
  password: string,
): Promise<{ appUserId: string; email: string }> {
  return apiFetch<{ appUserId: string; email: string }>(
    `/api/stores/${storeId}/password`,
    {
      method: "PATCH",
      body: JSON.stringify({ password }),
    },
  );
}
