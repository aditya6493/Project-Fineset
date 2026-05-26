import { NextResponse } from "next/server";
import {
  badRequest,
  getServerSession,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";
import { requireStaffContext } from "@/lib/auth/resolve-staff";
import { listStaffCalls } from "@/lib/services/staff-calls";
import { staffCallListQuerySchema } from "@/lib/validations/staff-calls.schema";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!requireRole(session, ["STAFF"])) return unauthorized();

  const staff = await requireStaffContext(session);
  if (!staff) return unauthorized();

  const { searchParams } = new URL(req.url);
  const query = staffCallListQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );
  if (!query.success) return badRequest(query.error.flatten());

  const result = await listStaffCalls({
    staffId: staff.staffId,
    storeId: staff.storeId,
    segment: query.data.segment,
    valueTier: query.data.valueTier,
    queue: query.data.queue,
    year: query.data.year,
    month: query.data.month,
    page: query.data.page,
    pageSize: query.data.pageSize,
  });

  return NextResponse.json(result);
}
