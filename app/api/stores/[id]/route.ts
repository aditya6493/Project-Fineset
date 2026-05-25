import { NextResponse } from "next/server";
import {
  badRequest,
  getServerSession,
  notFound,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";
import { getStoreById, updateStore } from "@/lib/services/stores";
import { updateStoreSchema } from "@/lib/validations/store.schema";

interface RouteParams {
  params: { id: string };
}

export async function GET(_req: Request, { params }: RouteParams) {
  const session = await getServerSession();
  if (!requireRole(session, ["MASTER_ADMIN"])) return unauthorized();

  const store = await getStoreById(params.id);
  if (!store) return notFound("Store not found");

  return NextResponse.json(store);
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const session = await getServerSession();
  if (!requireRole(session, ["MASTER_ADMIN"])) return unauthorized();

  const body: unknown = await req.json();
  const parsed = updateStoreSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.flatten());

  try {
    const store = await updateStore(params.id, parsed.data);
    return NextResponse.json(store);
  } catch {
    return notFound("Store not found");
  }
}
