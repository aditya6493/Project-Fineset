import { cache } from "react";
import { getServerSession, requireRole } from "@/lib/auth/session";
import { requireStaffContext, requirePortalActorContext } from "@/lib/auth/resolve-staff";
import { listStaffCalls } from "@/lib/services/staff-calls";
import { defaultStaffCallsParams } from "@/lib/query/initial-data";
import type { GetStaffCallsParams, StaffCallListResponse } from "@/types";

export interface InitialStaffCallsPayload {
  params: GetStaffCallsParams;
  data: StaffCallListResponse;
}

export const fetchInitialStaffCalls = cache(
  async (
    overrides: GetStaffCallsParams = {},
  ): Promise<InitialStaffCallsPayload | null> => {
    const session = await getServerSession();
    if (!requireRole(session, ["STAFF"])) return null;

    const staff = await requireStaffContext(session);
    if (!staff) return null;

    const params = defaultStaffCallsParams();
    const merged: GetStaffCallsParams = { ...params, ...overrides };

    const data = await listStaffCalls({
      staffId: staff.staffId,
      storeId: staff.storeId,
      master: merged.master ?? "ALL",
      segment: merged.segment ?? "ALL",
      valueTier: merged.valueTier ?? "ALL",
      queue: merged.queue ?? "ALL",
      birthday: merged.birthday ?? "ALL",
      anniversary: merged.anniversary ?? "ALL",
      year: merged.year ?? new Date().getFullYear(),
      month: merged.month ?? new Date().getMonth() + 1,
      page: merged.page ?? 1,
      pageSize: merged.pageSize ?? 15,
    });

    return { params: merged, data };
  },
);

export const fetchInitialStoreManagerCalls = cache(
  async (
    overrides: GetStaffCallsParams = {},
  ): Promise<InitialStaffCallsPayload | null> => {
    const session = await getServerSession();
    if (!requireRole(session, ["STORE_MANAGER"])) return null;

    const staff = await requirePortalActorContext(session);
    if (!staff) return null;

    const params = defaultStaffCallsParams();
    const merged: GetStaffCallsParams = { ...params, ...overrides };

    const data = await listStaffCalls({
      staffId: staff.staffId,
      storeId: staff.storeId,
      master: merged.master ?? "ALL",
      segment: merged.segment ?? "ALL",
      valueTier: merged.valueTier ?? "ALL",
      queue: merged.queue ?? "ALL",
      birthday: merged.birthday ?? "ALL",
      anniversary: merged.anniversary ?? "ALL",
      year: merged.year ?? new Date().getFullYear(),
      month: merged.month ?? new Date().getMonth() + 1,
      page: merged.page ?? 1,
      pageSize: merged.pageSize ?? 15,
    });

    return { params: merged, data };
  },
);
