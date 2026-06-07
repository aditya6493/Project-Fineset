import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api/route-handler";
import {
  getServerSession,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";
import { listAccessibleStores } from "@/lib/services/manager-stores";

/**
 * GET /api/store/my-stores
 * Store portal: stores accessible to the logged-in role (scoped in manager-stores).
 */
export async function GET() {
  try {
    const session = await getServerSession();
    if (!requireRole(session, ["STORE_MANAGER", "BUSINESS_OWNER"])) {
      return unauthorized();
    }

    const stores = await listAccessibleStores(session);

    return NextResponse.json({
      data: stores,
      selectedStoreId: session.storeId,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
