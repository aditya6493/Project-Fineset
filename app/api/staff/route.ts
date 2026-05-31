import { NextResponse } from "next/server";
import {
  badRequest,
  getServerSession,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";
import { InviteError } from "@/lib/auth/invite-user";
import { createStaff, getStaffPerformance, listStaff } from "@/lib/services/staff";
import { createStaffSchema } from "@/lib/validations/staff.schema";
import { getStaffQuerySchema } from "@/lib/validations/staff-query.schema";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!requireRole(session, ["STORE_MANAGER", "MASTER_ADMIN"])) {
    return unauthorized();
  }

  const { searchParams } = new URL(req.url);
  const query = getStaffQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );
  if (!query.success) return badRequest(query.error.flatten());

  if (query.data.performance === "true") {
    const storeId =
      session.role === "STORE_MANAGER"
        ? session.storeId
        : query.data.storeId ?? undefined;
    const data = await getStaffPerformance(storeId);
    return NextResponse.json(data);
  }

  if (session.role === "STORE_MANAGER") {
    const data = await listStaff(session.storeId);
    return NextResponse.json(data);
  }

  const storeId = query.data.storeId;
  if (!storeId) {
    const data = await getStaffPerformance();
    return NextResponse.json(data);
  }

  const data = await listStaff(storeId);
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!requireRole(session, ["STORE_MANAGER"])) return unauthorized();

  const body: unknown = await req.json();
  const parsed = createStaffSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.flatten());

  try {
    const staff = await createStaff(session.storeId, parsed.data);
    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    if (error instanceof InviteError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
