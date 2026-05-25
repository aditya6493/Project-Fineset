import { apiFetch, buildQueryString } from "@/lib/api/client";
import type { CreateVisitInput } from "@/lib/validations/visit.schema";
import type { GetVisitsParams, PaginatedResponse, VisitListItem } from "@/types";
import type { Visit } from "@prisma/client";

export async function createVisit(payload: CreateVisitInput): Promise<Visit> {
  return apiFetch<Visit>("/api/visits", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getVisits(
  params: GetVisitsParams = {},
): Promise<PaginatedResponse<VisitListItem>> {
  const qs = buildQueryString(params);
  return apiFetch<PaginatedResponse<VisitListItem>>(`/api/visits${qs}`);
}

export async function getVisitById(id: string): Promise<Visit> {
  return apiFetch<Visit>(`/api/visits/${id}`);
}
