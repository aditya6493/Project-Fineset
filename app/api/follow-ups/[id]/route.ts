import { NextResponse } from "next/server";
import { z } from "zod";
import {
  badRequest,
  getServerSession,
  notFound,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";
import { updateFollowUpStatus } from "@/lib/services/follow-ups";

const updateFollowUpSchema = z.object({
  status: z.enum(["OPEN", "CLOSED", "CONVERTED", "NO_RESPONSE"]),
});

interface RouteParams {
  params: { id: string };
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const session = await getServerSession();
  if (!requireRole(session, ["STORE_MANAGER"])) return unauthorized();

  const body: unknown = await req.json();
  const parsed = updateFollowUpSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.flatten());

  const updated = await updateFollowUpStatus(
    params.id,
    session.storeId,
    parsed.data.status,
  );
  if (!updated) return notFound("Follow-up not found");

  return NextResponse.json(updated);
}
