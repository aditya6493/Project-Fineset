import { NextResponse } from "next/server";
import { z } from "zod";
import {
  badRequest,
  getServerSession,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";
import { requireStaffContext } from "@/lib/auth/resolve-staff";
import { listFollowUps } from "@/lib/services/follow-ups";

const followUpQuerySchema = z.object({
  status: z.enum(["OPEN", "CLOSED", "CONVERTED", "NO_RESPONSE"]).optional(),
  overdue: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!requireRole(session, ["STORE_MANAGER", "STAFF"])) return unauthorized();

  const { searchParams } = new URL(req.url);
  const query = followUpQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );
  if (!query.success) return badRequest(query.error.flatten());

  const staff =
    session.role === "STAFF" ? await requireStaffContext(session) : null;
  if (session.role === "STAFF" && !staff) return unauthorized();

  const data = await listFollowUps({
    storeId: staff?.storeId ?? session.storeId,
    staffId: staff?.staffId,
    status: query.data.status,
    overdue: query.data.overdue,
  });

  return NextResponse.json(data);
}
