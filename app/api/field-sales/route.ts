import { NextResponse } from "next/server";
import {
  badRequest,
  getServerSession,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";
import { handleRouteError } from "@/lib/api/route-handler";
import { requireStaffContext } from "@/lib/auth/resolve-staff";
import { createFieldSale, listFieldSales } from "@/lib/services/field-sales";
import {
  createFieldSaleSchema,
  getFieldSalesQuerySchema,
} from "@/lib/validations/field-sale.schema";

export async function GET(req: Request) {
  const startedAt = Date.now();
  try {
    const session = await getServerSession();
    if (!requireRole(session, ["STORE_MANAGER", "MASTER_ADMIN"])) {
      return unauthorized();
    }

    const { searchParams } = new URL(req.url);
    const query = getFieldSalesQuerySchema.safeParse(
      Object.fromEntries(searchParams.entries()),
    );
    if (!query.success) return badRequest(query.error.flatten());

    let storeId: string | undefined;
    if (session.role === "STORE_MANAGER") {
      storeId = session.storeId;
    } else if (query.data.storeId) {
      storeId = query.data.storeId;
    }

    const result = await listFieldSales({
      ...query.data,
      storeId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[api.field-sales] failed", {
      elapsedMs: Date.now() - startedAt,
      error,
    });
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  const startedAt = Date.now();
  try {
    const session = await getServerSession();
    if (!requireRole(session, ["STAFF"])) return unauthorized();

    const staff = await requireStaffContext(session);
    if (!staff) return unauthorized();

    const body: unknown = await req.json();
    const parsed = createFieldSaleSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.flatten());

    const fieldSale = await createFieldSale({
      ...parsed.data,
      storeId: staff.storeId,
      staffId: staff.staffId,
    });

    return NextResponse.json(fieldSale, { status: 201 });
  } catch (error) {
    console.error("[api.field-sales] create failed", {
      elapsedMs: Date.now() - startedAt,
      error,
    });
    return handleRouteError(error);
  }
}
