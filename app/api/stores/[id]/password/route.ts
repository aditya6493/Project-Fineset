import { NextResponse } from "next/server";
import {
  badRequest,
  getServerSession,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";
import { handleRouteError } from "@/lib/api/route-handler";
import {
  StoreServiceError,
  updateStoreManagerPassword,
} from "@/lib/services/stores";
import { updateStoreManagerPasswordSchema } from "@/lib/validations/store-password.schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getServerSession();
    if (!requireRole(session, ["MASTER_ADMIN"])) return unauthorized();

    const body: unknown = await req.json();
    const parsed = updateStoreManagerPasswordSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.flatten());

    const result = await updateStoreManagerPassword(id, parsed.data.password);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof StoreServiceError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return handleRouteError(error);
  }
}
