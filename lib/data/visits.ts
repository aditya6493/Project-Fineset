import { getServerSession, requireRole } from "@/lib/auth/session";
import { listVisits } from "@/lib/services/visits";
import { DEFAULT_VISITS_PARAMS } from "@/lib/query/initial-data";
import type { GetVisitsParams, PaginatedResponse, VisitListItem } from "@/types";

export interface InitialVisitsPayload {
  params: GetVisitsParams;
  data: PaginatedResponse<VisitListItem>;
}

export async function fetchInitialVisits(
  overrides: GetVisitsParams = {},
): Promise<InitialVisitsPayload | null> {
  const session = await getServerSession();
  if (!requireRole(session, ["STORE_MANAGER", "MASTER_ADMIN"])) {
    return null;
  }

  const params: GetVisitsParams = { ...DEFAULT_VISITS_PARAMS, ...overrides };
  const page = Number(params.page ?? 1);
  const pageSize = Number(params.pageSize ?? 20);

  let storeId: string | undefined;
  if (session.role === "STORE_MANAGER") {
    storeId = session.storeId;
  }

  const { data, total } = await listVisits({
    storeId,
    page,
    pageSize,
    search: params.search,
    startDate: params.startDate ? new Date(params.startDate) : undefined,
    endDate: params.endDate ? new Date(params.endDate) : undefined,
    sortBy: params.sortBy ?? "visitDate",
    sortOrder: params.sortOrder ?? "desc",
    followUpOnly: params.followUpOnly === "true",
  });

  return {
    params,
    data: { data, total, page, pageSize },
  };
}
