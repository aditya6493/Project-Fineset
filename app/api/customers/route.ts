import { NextResponse } from "next/server";
import {
  badRequest,
  getServerSession,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";
import { listCustomers } from "@/lib/services/customers";
import { getCustomersQuerySchema } from "@/lib/validations/analytics.schema";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!requireRole(session, ["STORE_MANAGER", "MASTER_ADMIN"])) {
    return unauthorized();
  }

  const { searchParams } = new URL(req.url);
  const query = getCustomersQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );
  if (!query.success) return badRequest(query.error.flatten());

  let storeId: string | undefined;
  if (session.role === "STORE_MANAGER") {
    storeId = session.storeId;
  } else if (query.data.storeId) {
    storeId = query.data.storeId;
  }

  const { data, total } = await listCustomers({
    storeId,
    page: query.data.page,
    pageSize: query.data.pageSize,
    search: query.data.search,
  });

  return NextResponse.json({
    data,
    total,
    page: query.data.page,
    pageSize: query.data.pageSize,
  });
}
