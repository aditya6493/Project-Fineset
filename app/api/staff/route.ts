import { NextResponse } from "next/server";
import {
  badRequest,
  getServerSession,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";
import { createStaff, getStaffPerformance, listStaff } from "@/lib/services/staff";
import { createStaffSchema } from "@/lib/validations/staff.schema";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!requireRole(session, ["STORE_MANAGER", "MASTER_ADMIN"])) {
    return unauthorized();
  }

  const { searchParams } = new URL(req.url);
  const performance = searchParams.get("performance");

  if (performance === "true") {
    const storeId =
      session.role === "STORE_MANAGER"
        ? session.storeId
        : searchParams.get("storeId") ?? undefined;
    const data = await getStaffPerformance(storeId);
    return NextResponse.json(data);
  }

  if (session.role === "STORE_MANAGER") {
    const data = await listStaff(session.storeId);
    return NextResponse.json(data);
  }

  const storeId = searchParams.get("storeId");
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

  const staff = await createStaff(session.storeId, parsed.data);
  return NextResponse.json(staff, { status: 201 });
}
