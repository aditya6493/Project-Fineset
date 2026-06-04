import { NextResponse } from "next/server";
import {
  badRequest,
  getServerSession,
  notFound,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";
import { handleRouteError } from "@/lib/api/route-handler";
import {
  getCustomerProfile,
  resolveCustomerId,
} from "@/lib/services/customer-profile";
import { getCustomerProfileQuerySchema } from "@/lib/validations/customer.schema";

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!requireRole(session, ["STORE_MANAGER", "MASTER_ADMIN"])) {
      return unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const query = getCustomerProfileQuerySchema.safeParse(
      Object.fromEntries(searchParams.entries()),
    );
    if (!query.success) return badRequest(query.error.flatten());

    const storeId =
      session.role === "STORE_MANAGER"
        ? session.storeId
        : searchParams.get("storeId") ?? undefined;

    if (!storeId) {
      return badRequest({ message: "storeId is required for admin profile lookup" });
    }

    const customerId = await resolveCustomerId({
      customerId: query.data.customerId,
      visitId: query.data.visitId,
      storeId,
    });

    if (!customerId) return notFound();

    const profile = await getCustomerProfile(customerId, storeId);
    if (!profile) return notFound();

    return NextResponse.json(profile);
  } catch (error) {
    return handleRouteError(error);
  }
}
