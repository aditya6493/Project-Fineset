import { NextResponse } from "next/server";
import {
  getServerSession,
  notFound,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";
import { handleRouteError } from "@/lib/api/route-handler";
import { restoreStore, StoreServiceError } from "@/lib/services/stores";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** Restore a soft-deleted store within the 90-day grace period. */
export async function POST(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession();
    if (!requireRole(session, ["MASTER_ADMIN"])) return unauthorized();

    const store = await restoreStore(id);
    return NextResponse.json(store);
  } catch (error) {
    if (error instanceof StoreServiceError && error.status === 404) {
      return notFound(error.message);
    }
    return handleRouteError(error);
  }
}
