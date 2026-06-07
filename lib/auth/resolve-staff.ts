import { cache } from "react";
import { prisma } from "@/lib/db/prisma";
import type { AppSession, StaffSession } from "@/types";

export interface ResolvedStaffContext {
  staffId: string;
  storeId: string;
}

export async function requireStaffContext(
  session: AppSession | null,
): Promise<ResolvedStaffContext | null> {
  if (!session || session.role !== "STAFF") return null;
  return resolveStaffContext(session);
}

function isPlaceholderDevId(value: string): boolean {
  return value.startsWith("dev-");
}

async function resolveStaffContextFromDb(
  session: StaffSession,
): Promise<ResolvedStaffContext | null> {
  if (session.employeeId) {
    const byEmployeeId = await prisma.staff.findFirst({
      where: {
        employeeId: session.employeeId,
        isActive: true,
        role: "STAFF",
      },
      select: { id: true, storeId: true },
    });

    if (byEmployeeId) {
      return { staffId: byEmployeeId.id, storeId: byEmployeeId.storeId };
    }
  }

  if (!isPlaceholderDevId(session.staffId)) {
    const byId = await prisma.staff.findFirst({
      where: {
        id: session.staffId,
        isActive: true,
        role: "STAFF",
      },
      select: { id: true, storeId: true },
    });

    if (byId) {
      return { staffId: byId.id, storeId: byId.storeId };
    }
  }

  const byNameWhere: {
    name: { equals: string; mode: "insensitive" };
    storeId?: string;
    isActive: true;
    role: "STAFF";
  } = {
    name: { equals: session.name, mode: "insensitive" },
    isActive: true,
    role: "STAFF",
  };

  if (!isPlaceholderDevId(session.storeId)) {
    byNameWhere.storeId = session.storeId;
  }

  const byName = await prisma.staff.findFirst({
    where: byNameWhere,
    select: { id: true, storeId: true },
  });

  if (byName) {
    return { staffId: byName.id, storeId: byName.storeId };
  }

  return null;
}

/** Request-scoped; skips DB when the session already carries seeded staff/store ids. */
export const resolveStaffContext = cache(
  async (session: StaffSession): Promise<ResolvedStaffContext | null> => {
    if (
      session.staffId &&
      session.storeId &&
      !isPlaceholderDevId(session.staffId) &&
      !isPlaceholderDevId(session.storeId)
    ) {
      return { staffId: session.staffId, storeId: session.storeId };
    }

    return resolveStaffContextFromDb(session);
  },
);
