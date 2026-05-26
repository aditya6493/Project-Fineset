import { NextResponse } from "next/server";
import {
  badRequest,
  getServerSession,
  notFound,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";
import { requireStaffContext } from "@/lib/auth/resolve-staff";
import {
  recordStaffCallOutcome,
  revealStaffCallPhone,
} from "@/lib/services/staff-calls";
import { staffCallOutcomeSchema } from "@/lib/validations/staff-calls.schema";

interface RouteParams {
  params: Promise<{ visitId: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  const { visitId } = await params;
  const session = await getServerSession();
  if (!requireRole(session, ["STAFF"])) return unauthorized();

  const staff = await requireStaffContext(session);
  if (!staff) return unauthorized();

  const body: unknown = await req.json();
  const parsed = staffCallOutcomeSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.flatten());

  const result = await recordStaffCallOutcome({
    visitId,
    staffId: staff.staffId,
    storeId: staff.storeId,
    ...parsed.data,
  });

  if (!result) return notFound("Visit not found");

  return NextResponse.json(result);
}

export async function GET(_req: Request, { params }: RouteParams) {
  const { visitId } = await params;
  const session = await getServerSession();
  if (!requireRole(session, ["STAFF"])) return unauthorized();

  const staff = await requireStaffContext(session);
  if (!staff) return unauthorized();

  const result = await revealStaffCallPhone({
    visitId,
    staffId: staff.staffId,
    storeId: staff.storeId,
  });

  if (!result) return notFound("Phone number unavailable for this visit");

  return NextResponse.json(result);
}
