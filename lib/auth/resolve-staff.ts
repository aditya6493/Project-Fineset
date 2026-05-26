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

export async function resolveStaffContext(
  session: StaffSession,
): Promise<ResolvedStaffContext | null> {
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

  const byName = await prisma.staff.findFirst({
    where: {
      name: { equals: session.name, mode: "insensitive" },
      storeId: session.storeId,
      isActive: true,
      role: "STAFF",
    },
    select: { id: true, storeId: true },
  });

  if (byName) {
    return { staffId: byName.id, storeId: byName.storeId };
  }

  return null;
}
