import { NextResponse } from "next/server";
import {
  forbidden,
  getServerSession,
  notFound,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";
import { requireStaffContext } from "@/lib/auth/resolve-staff";
import { getVisitById } from "@/lib/services/visits";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const session = await getServerSession();
  if (!requireRole(session, ["STORE_MANAGER", "BUSINESS_OWNER", "MASTER_ADMIN", "STAFF"])) {
    return unauthorized();
  }

  const storeId =
    session.role === "MASTER_ADMIN" ? undefined : session.storeId;

  const visit = await getVisitById(id, storeId);
  if (!visit) return notFound();

  if (session.role === "STAFF") {
    const staff = await requireStaffContext(session);
    if (!staff || visit.staffId !== staff.staffId) {
      return forbidden();
    }
  }

  return NextResponse.json(visit);
}
