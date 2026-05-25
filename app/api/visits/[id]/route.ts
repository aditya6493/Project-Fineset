import { NextResponse } from "next/server";
import {
  forbidden,
  getServerSession,
  notFound,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";
import { getVisitById } from "@/lib/services/visits";

interface RouteParams {
  params: { id: string };
}

export async function GET(_req: Request, { params }: RouteParams) {
  const session = await getServerSession();
  if (!requireRole(session, ["STORE_MANAGER", "MASTER_ADMIN", "STAFF"])) {
    return unauthorized();
  }

  const storeId =
    session.role === "MASTER_ADMIN" ? undefined : session.storeId;

  const visit = await getVisitById(params.id, storeId);
  if (!visit) return notFound();

  if (session.role === "STAFF" && visit.staffId !== session.staffId) {
    return forbidden();
  }

  return NextResponse.json(visit);
}
