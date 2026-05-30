import { prisma } from "@/lib/db/prisma";
import { logAuthEvent } from "@/lib/auth/audit";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthRedirectBaseUrl } from "@/lib/supabase/env";
import type { InviteUserInput } from "@/lib/validations/user-invite.schema";
import type { AppRole } from "@prisma/client";

export interface InviteUserResult {
  appUserId: string;
  email: string;
  role: AppRole;
}

export async function inviteUser(
  input: InviteUserInput,
): Promise<InviteUserResult> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();

  const existing = await prisma.appUser.findUnique({ where: { email } });
  if (existing) {
    throw new InviteError("This email is already registered", 409);
  }

  if (input.storeId) {
    const store = await prisma.store.findFirst({
      where: { id: input.storeId, isActive: true },
    });
    if (!store) {
      throw new InviteError("Store not found or inactive", 404);
    }
  }

  let staffId: string | undefined;

  if (input.role === "STAFF") {
    if (!input.employeeId || !input.storeId) {
      throw new InviteError("Staff invite requires employeeId and storeId", 400);
    }

    const duplicateEmployee = await prisma.staff.findUnique({
      where: { employeeId: input.employeeId },
    });
    if (duplicateEmployee) {
      throw new InviteError("Employee ID already exists", 409);
    }

    const staff = await prisma.staff.create({
      data: {
        name,
        employeeId: input.employeeId,
        storeId: input.storeId,
        role: "STAFF",
        isActive: true,
      },
    });
    staffId = staff.id;
  }

  const redirectTo = `${getAuthRedirectBaseUrl()}/auth/callback`;
  const supabase = createAdminClient();

  const { data: invited, error: inviteError } =
    await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: {
        name,
        role: input.role,
      },
    });

  if (inviteError || !invited.user) {
    if (staffId) {
      await prisma.staff.delete({ where: { id: staffId } }).catch(() => undefined);
    }
    await logAuthEvent({
      event: "INVITE_FAILED",
      email,
      metadata: { reason: inviteError?.message ?? "unknown" },
    });
    throw new InviteError(
      inviteError?.message ?? "Failed to send invitation",
      502,
    );
  }

  const authId = invited.user.id;

  const appUser = await prisma.appUser.create({
    data: {
      authId,
      email,
      name,
      role: input.role,
      storeId: input.storeId,
      staffId,
      isActive: false,
      invitedAt: new Date(),
    },
  });

  let storeName: string | null = null;
  let employeeId: string | null = null;

  if (input.storeId) {
    const store = await prisma.store.findUnique({
      where: { id: input.storeId },
      select: { name: true },
    });
    storeName = store?.name ?? null;
  }

  if (staffId) {
    employeeId = input.employeeId ?? null;
  }

  await supabase.auth.admin.updateUserById(authId, {
    app_metadata: {
      role: input.role,
      storeId: input.storeId ?? null,
      staffId: staffId ?? null,
      appUserId: appUser.id,
      name,
      storeName,
      employeeId,
      isActive: false,
    },
  });

  await logAuthEvent({
    event: "INVITE_SENT",
    authId,
    email,
    metadata: { role: input.role, storeId: input.storeId, appUserId: appUser.id },
  });

  return {
    appUserId: appUser.id,
    email,
    role: input.role,
  };
}

export class InviteError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "InviteError";
  }
}
