import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import type { z } from "zod";
import type { AppSession } from "@/types";
import {
  badRequest,
  forbidden,
  getServerSession,
  notFound,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";

type Role = AppSession["role"];

export function handleRouteError(error: unknown): NextResponse {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    const message = String(error.message ?? "");
    if (
      /Authentication failed against database server|ECIRCUITBREAKER|too many authentication failures/i.test(
        message,
      )
    ) {
      return NextResponse.json(
        { message: "Database connection is temporarily unavailable" },
        { status: 503 },
      );
    }
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Resource already exists", code: error.code },
        { status: 409 },
      );
    }
    if (error.code === "P2025") {
      return notFound();
    }
  }

  console.error("[api]", error);
  return NextResponse.json({ message: "Internal server error" }, { status: 500 });
}

export async function withAuth<T extends Role>(
  allowed: readonly T[],
  handler: (session: Extract<AppSession, { role: T }>, req: Request) => Promise<NextResponse>,
): Promise<(req: Request) => Promise<NextResponse>> {
  return async (req: Request) => {
    try {
      const session = await getServerSession();
      if (!session) return unauthorized();
      if (!requireRole(session, allowed)) return forbidden();
      return await handler(session as Extract<AppSession, { role: T }>, req);
    } catch (error) {
      return handleRouteError(error);
    }
  };
}

export async function withAuthValidation<T extends Role, S extends z.ZodType>(
  allowed: readonly T[],
  schema: S,
  handler: (
    session: Extract<AppSession, { role: T }>,
    data: z.infer<S>,
    req: Request,
  ) => Promise<NextResponse>,
): Promise<(req: Request) => Promise<NextResponse>> {
  return async (req: Request) => {
    try {
      const session = await getServerSession();
      if (!session) return unauthorized();
      if (!requireRole(session, allowed)) return forbidden();

      const body: unknown = await req.json();
      const parsed = schema.safeParse(body);
      if (!parsed.success) return badRequest(parsed.error.flatten());

      return await handler(
        session as Extract<AppSession, { role: T }>,
        parsed.data,
        req,
      );
    } catch (error) {
      return handleRouteError(error);
    }
  };
}
