import { prisma } from "@/lib/db/prisma";
import { logAuthEvent } from "@/lib/auth/audit";
import { validatePassword } from "@/lib/auth/password-policy";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthRedirectBaseUrl } from "@/lib/supabase/env";
import type { InviteUserInput } from "@/lib/validations/user-invite.schema";
import type { AppRole } from "@prisma/client";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface InviteUserResult {
  appUserId: string;
  email: string;
  role: AppRole;
}

async function createSupabaseAuthUser(
  supabase: SupabaseClient,
  email: string,
  password: string,
  name: string,
  role: AppRole,
): Promise<string> {
  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role },
    });

  if (!createError && created.user) {
    return created.user.id;
  }

  if (createError?.message.includes("already been registered")) {
    throw new InviteError("This email is already registered", 409);
  }

  throw new InviteError(
    createError?.message ?? "Failed to create auth user",
    502,
  );
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

  const supabase = createAdminClient();
  const now = new Date();
  let authId: string;
  let provisionedWithPassword = false;

  if (input.password) {
    const passwordCheck = validatePassword(input.password);
    if (!passwordCheck.success) {
      if (staffId) {
        await prisma.staff.delete({ where: { id: staffId } }).catch(() => undefined);
      }
      throw new InviteError(passwordCheck.error ?? "Invalid password", 400);
    }

    try {
      authId = await createSupabaseAuthUser(
        supabase,
        email,
        input.password,
        name,
        input.role,
      );
      provisionedWithPassword = true;
    } catch (error) {
      if (staffId) {
        await prisma.staff.delete({ where: { id: staffId } }).catch(() => undefined);
      }
      throw error;
    }
  } else {
    const redirectTo = `${getAuthRedirectBaseUrl()}/auth/callback`;
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

    authId = invited.user.id;
  }

  const appUser = await prisma.appUser.create({
    data: {
      authId,
      email,
      name,
      role: input.role,
      storeId: input.storeId,
      staffId,
      isActive: provisionedWithPassword,
      invitedAt: now,
      activatedAt: provisionedWithPassword ? now : undefined,
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
      isActive: provisionedWithPassword,
    },
  });

  await logAuthEvent({
    event: provisionedWithPassword ? "USER_CREATED_WITH_PASSWORD" : "INVITE_SENT",
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
