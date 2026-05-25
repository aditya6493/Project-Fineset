import { apiFetch } from "@/lib/api/client";
import type { CreateStaffInput, UpdateStaffInput } from "@/lib/validations/staff.schema";
import type { StaffPerformanceRow } from "@/types";
import type { Staff } from "@prisma/client";

interface StaffListItem {
  id: string;
  name: string;
  employeeId: string;
  isActive: boolean;
  visitCount: number;
  monthlyVisits: number;
  monthlyRevenue: number;
  conversionRate: number;
  openFollowUps: number;
}

export async function getStaff(): Promise<StaffListItem[]> {
  return apiFetch<StaffListItem[]>("/api/staff");
}

export async function createStaff(payload: CreateStaffInput): Promise<Staff> {
  return apiFetch<Staff>("/api/staff", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateStaff(
  staffId: string,
  payload: UpdateStaffInput,
): Promise<{ count: number }> {
  return apiFetch<{ count: number }>(`/api/staff/${staffId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getStaffPerformance(
  storeId?: string,
): Promise<StaffPerformanceRow[]> {
  const qs = storeId ? `?storeId=${storeId}` : "";
  return apiFetch<StaffPerformanceRow[]>(`/api/staff/performance${qs}`);
}
