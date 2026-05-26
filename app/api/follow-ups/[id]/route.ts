import { NextResponse } from "next/server";
import { z } from "zod";
import {
  badRequest,
  getServerSession,
  notFound,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";
import { requireStaffContext } from "@/lib/auth/resolve-staff";
import { updateFollowUpStatus } from "@/lib/services/follow-ups";

const updateFollowUpSchema = z.object({
  status: z.enum(["OPEN", "CLOSED", "CONVERTED", "NO_RESPONSE"]),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const { id } = await params;
  const session = await getServerSession();
  if (!requireRole(session, ["STORE_MANAGER", "STAFF"])) return unauthorized();

  const body: unknown = await req.json();
  const parsed = updateFollowUpSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.flatten());

  const staff =
    session.role === "STAFF" ? await requireStaffContext(session) : null;
  if (session.role === "STAFF" && !staff) return unauthorized();

  const updated = await updateFollowUpStatus(
    id,
    staff?.storeId ?? session.storeId,
    parsed.data.status,
    staff?.staffId,
  );
  if (!updated) return notFound("Follow-up not found");

  return NextResponse.json(updated);
}
