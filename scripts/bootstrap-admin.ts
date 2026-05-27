/**
 * Phase 2: Create the first MASTER_ADMIN in Supabase Auth + Prisma AppUser.
 *
 * Usage: npm run auth:bootstrap
 * Requires: SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, MASTER_ADMIN_* in .env.local
 */
import { PrismaClient } from "@prisma/client";
import { createAdminClient } from "../lib/supabase/admin";
import { validatePassword } from "../lib/auth/password-policy";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = process.env.MASTER_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.MASTER_ADMIN_PASSWORD?.trim();
  const name = process.env.MASTER_ADMIN_NAME?.trim() ?? "FineSet Admin";

  if (!email || !password) {
    throw new Error(
      "Set MASTER_ADMIN_EMAIL and MASTER_ADMIN_PASSWORD in .env.local",
    );
  }

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.success) {
    throw new Error(passwordCheck.error ?? "Invalid password");
  }

  const existing = await prisma.appUser.findUnique({ where: { email } });
  if (existing?.isActive) {
    console.log(`Admin already exists for ${email} (AppUser ${existing.id})`);
    return;
  }

  const supabase = createAdminClient();

  let authId: string;

  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: "MASTER_ADMIN" },
    });

  if (createError) {
    if (createError.message.includes("already been registered")) {
      const { data: listData, error: listError } =
        await supabase.auth.admin.listUsers();
      if (listError) throw listError;
      const found = listData.users.find(
        (u) => u.email?.toLowerCase() === email,
      );
      if (!found) throw createError;
      authId = found.id;
      console.log(`Using existing Supabase user ${authId}`);
    } else {
      throw createError;
    }
  } else {
    if (!created.user) throw new Error("No user returned from Supabase");
    authId = created.user.id;
    console.log(`Created Supabase user ${authId}`);
  }

  await prisma.appUser.upsert({
    where: { email },
    create: {
      authId,
      email,
      name,
      role: "MASTER_ADMIN",
      isActive: true,
      activatedAt: new Date(),
    },
    update: {
      authId,
      name,
      role: "MASTER_ADMIN",
      isActive: true,
      activatedAt: new Date(),
    },
  });

  console.log(`MASTER_ADMIN ready: ${email}`);
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
