import { apiFetch, buildQueryString } from "@/lib/api/client";
import type { FollowUpListItem, FollowUpStatus, AdminFollowUpOverview } from "@/types";

interface GetFollowUpsParams {
  status?: FollowUpStatus;
  overdue?: boolean;
}

export async function getFollowUps(
  params: GetFollowUpsParams = {},
): Promise<FollowUpListItem[]> {
  const qs = buildQueryString({
    status: params.status,
    overdue: params.overdue ? "true" : undefined,
  });
  return apiFetch<FollowUpListItem[]>(`/api/follow-ups${qs}`);
}

export async function updateFollowUpStatus(
  followUpId: string,
  status: FollowUpStatus,
): Promise<{ id: string; status: FollowUpStatus }> {
  return apiFetch<{ id: string; status: FollowUpStatus }>(
    `/api/follow-ups/${followUpId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
}

export async function getAdminFollowUpOverview(): Promise<AdminFollowUpOverview> {
  return apiFetch<AdminFollowUpOverview>("/api/follow-ups/admin");
}
