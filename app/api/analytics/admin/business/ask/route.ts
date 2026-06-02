import { NextResponse } from "next/server";
import {
  badRequest,
  getServerSession,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";
import { askAdminBusinessAnalytics } from "@/lib/services/admin-business-analytics-ask";
import { analyticsAskBodySchema } from "@/lib/validations/admin-business-analytics-ask.schema";

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!requireRole(session, ["MASTER_ADMIN"])) return unauthorized();

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return badRequest({ message: "Invalid JSON body" });
  }

  const parsed = analyticsAskBodySchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.flatten());

  try {
    const data = await askAdminBusinessAnalytics(parsed.data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[analytics-ask]", error);
    const message = error instanceof Error ? error.message : "Analytics ask failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
