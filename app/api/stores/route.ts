import { NextResponse } from "next/server";
import {
  badRequest,
  getServerSession,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";
import { handleRouteError } from "@/lib/api/route-handler";
import { InviteError } from "@/lib/auth/invite-user";
import { createStore, listStores } from "@/lib/services/stores";
import { createStoreSchema, getStoresQuerySchema } from "@/lib/validations/store.schema";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!requireRole(session, ["MASTER_ADMIN"])) return unauthorized();

  const { searchParams } = new URL(req.url);
  const query = getStoresQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );
  if (!query.success) return badRequest(query.error.flatten());

  const { data, total } = await listStores({
    page: query.data.page,
    pageSize: query.data.pageSize,
    search: query.data.search,
    activeOnly: query.data.activeOnly,
    period: query.data.period,
  });

  return NextResponse.json({
    data,
    total,
    page: query.data.page,
    pageSize: query.data.pageSize,
  });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!requireRole(session, ["MASTER_ADMIN"])) return unauthorized();

    const body: unknown = await req.json();
    const parsed = createStoreSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.flatten());

    const store = await createStore(parsed.data);
    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    if (error instanceof InviteError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return handleRouteError(error);
  }
}
