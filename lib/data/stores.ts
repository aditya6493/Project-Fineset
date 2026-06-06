import { cache } from "react";
import { getServerSession, requireRole } from "@/lib/auth/session";
import { listStores } from "@/lib/services/stores";
import { DEFAULT_STORES_PARAMS } from "@/lib/query/initial-data";

import type { PaginatedResponse, StoreCategory } from "@/types";

export interface StoresListParams {
  page: number;
  pageSize: number;
  search?: string;
}

type StoreListItem = {
  id: string;
  name: string;
  category: StoreCategory;
  customCategory: string | null;
  city: string;
  state: string;
  pincode: string | null;
  businessOwnerName: string | null;
  businessOwnerEmail: string | null;
  isActive: boolean;
  staffCount: number;
  visits: number;
  revenue: number;
  conversionRate: number;
  createdAt: string;
};

export interface InitialStoresPayload {
  params: StoresListParams;
  data: PaginatedResponse<StoreListItem>;
}

export const fetchInitialStores = cache(
  async (
    overrides: Partial<StoresListParams> = {},
  ): Promise<InitialStoresPayload | null> => {
    const session = await getServerSession();
    if (!requireRole(session, ["MASTER_ADMIN"])) return null;

    const params: StoresListParams = { ...DEFAULT_STORES_PARAMS, ...overrides };
    const data = await listStores(params);

    return {
      params,
      data: {
        data: data.data,
        total: data.total,
        page: params.page,
        pageSize: params.pageSize,
      },
    };
  },
);
