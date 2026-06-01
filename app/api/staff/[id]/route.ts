import { NextResponse } from "next/server";
import {
  badRequest,
  getServerSession,
  notFound,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";
import { deleteStaff, StaffDeleteError, updateStaff } from "@/lib/services/staff";
import { updateStaffSchema } from "@/lib/validations/staff.schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const { id } = await params;
  const session = await getServerSession();
  if (!requireRole(session, ["STORE_MANAGER"])) return unauthorized();

  const body: unknown = await req.json();
  const parsed = updateStaffSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.flatten());

  const result = await updateStaff(id, session.storeId, parsed.data);
  if (result.count === 0) return notFound("Staff member not found");

  return NextResponse.json({ count: result.count });
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const session = await getServerSession();
  if (!requireRole(session, ["STORE_MANAGER"])) return unauthorized();

  try {
    await deleteStaff(id, session.storeId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof StaffDeleteError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
