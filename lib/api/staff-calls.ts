import { apiFetch, buildQueryString } from "@/lib/api/client";
import type {
  GetStaffCallsParams,
  StaffCallDialResult,
  StaffCallListResponse,
  StaffCallOutcomeResult,
} from "@/types";
import type { StaffCallOutcomeInput } from "@/lib/validations/staff-calls.schema";

export async function getStaffCalls(
  params: GetStaffCallsParams = {},
): Promise<StaffCallListResponse> {
  const qs = buildQueryString(params);
  return apiFetch<StaffCallListResponse>(`/api/staff/calls${qs}`);
}

export async function revealStaffCallPhone(
  visitId: string,
): Promise<StaffCallDialResult> {
  return apiFetch<StaffCallDialResult>(`/api/staff/calls/${visitId}`);
}

export async function submitStaffCallOutcome(
  visitId: string,
  payload: StaffCallOutcomeInput,
): Promise<StaffCallOutcomeResult> {
  return apiFetch<StaffCallOutcomeResult>(`/api/staff/calls/${visitId}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
