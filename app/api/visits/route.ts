import { NextResponse } from "next/server";
import {
  badRequest,
  getServerSession,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";
import { requireStaffContext } from "@/lib/auth/resolve-staff";
import { checkWriteRateLimit, getRequestIdentifier } from "@/lib/rate-limit";
import { createVisit, listVisits } from "@/lib/services/visits";
import { handleRouteError } from "@/lib/api/route-handler";
import {
  createVisitSchema,
  getVisitsQuerySchema,
} from "@/lib/validations/visit.schema";

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!requireRole(session, ["STAFF"])) return unauthorized();

  const staff = await requireStaffContext(session);
  if (!staff) return unauthorized();

  const identifier = await getRequestIdentifier();
  const writeLimit = await checkWriteRateLimit(identifier);
  if (!writeLimit.success) {
    return NextResponse.json(
      { message: "Too many requests" },
      { status: 429 },
    );
  }

  const body: unknown = await req.json();
  const parsed = createVisitSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.flatten());

  const visit = await createVisit({
    ...parsed.data,
    storeId: staff.storeId,
    staffId: staff.staffId,
  });

  return NextResponse.json(visit, { status: 201 });
}

export async function GET(req: Request) {
  const startedAt = Date.now();
  try {
    const session = await getServerSession();
    if (!requireRole(session, ["STORE_MANAGER", "MASTER_ADMIN"])) {
      return unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const query = getVisitsQuerySchema.safeParse(
      Object.fromEntries(searchParams.entries()),
    );
    if (!query.success) return badRequest(query.error.flatten());

    let storeId: string | undefined;
    if (session.role === "STORE_MANAGER") {
      storeId = session.storeId;
    } else if (query.data.storeId) {
      storeId = query.data.storeId;
    }

    const { data, total } = await listVisits({
      storeId,
      page: query.data.page,
      pageSize: query.data.pageSize,
      search: query.data.search,
      startDate: query.data.startDate,
      endDate: query.data.endDate,
      sortBy: query.data.sortBy,
      sortOrder: query.data.sortOrder,
      followUpOnly: query.data.followUpOnly,
    });

    return NextResponse.json({
      data,
      total,
      page: query.data.page,
      pageSize: query.data.pageSize,
    });
  } catch (error) {
    console.error("[api.visits] failed", {
      elapsedMs: Date.now() - startedAt,
      error,
    });
    return handleRouteError(error);
  }
}
