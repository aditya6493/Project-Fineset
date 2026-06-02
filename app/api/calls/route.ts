import { NextResponse } from "next/server";
import {
  badRequest,
  getServerSession,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";
import { handleRouteError } from "@/lib/api/route-handler";
import { listPortalCalls } from "@/lib/services/portal-calls";
import { portalCallsQuerySchema } from "@/lib/validations/portal-calls.schema";

export async function GET(req: Request) {
  const startedAt = Date.now();
  try {
    const session = await getServerSession();
    if (!requireRole(session, ["STORE_MANAGER", "MASTER_ADMIN"])) {
      return unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const query = portalCallsQuerySchema.safeParse(
      Object.fromEntries(searchParams.entries()),
    );
    if (!query.success) return badRequest(query.error.flatten());

    let storeId: string | undefined;
    if (session.role === "STORE_MANAGER") {
      storeId = session.storeId;
    } else if (query.data.storeId) {
      storeId = query.data.storeId;
    }

    const result = await listPortalCalls({
      ...query.data,
      storeId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[api.calls] failed", {
      elapsedMs: Date.now() - startedAt,
      error,
    });
    return handleRouteError(error);
  }
}
