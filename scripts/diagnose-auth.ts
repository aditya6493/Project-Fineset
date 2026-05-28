/**
 * Diagnose login issues for MASTER_ADMIN (no secrets printed).
 * Usage: npm run auth:diagnose
 */
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "../lib/supabase/admin";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = process.env.MASTER_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.MASTER_ADMIN_PASSWORD?.trim();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  console.log("--- Auth diagnose ---");
  console.log("Email:", email ?? "(missing MASTER_ADMIN_EMAIL)");
  console.log("Password set:", password ? "yes" : "no");
  console.log("Supabase URL set:", url ? "yes" : "no");
  console.log("Anon key set:", anonKey ? "yes" : "no");
  console.log("DATABASE_URL set:", process.env.DATABASE_URL ? "yes" : "no");

  if (!email || !password || !url || !anonKey) {
    throw new Error("Missing required env vars in .env.local");
  }

  const admin = createAdminClient();
  const { data: listData, error: listError } = await admin.auth.admin.listUsers();
  if (listError) throw listError;

  const supabaseUser = listData.users.find((u) => u.email?.toLowerCase() === email);
  if (!supabaseUser) {
    console.log("\nFAIL: No Supabase Auth user for this email. Run npm run auth:bootstrap");
    return;
  }
  console.log("\nSupabase user id:", supabaseUser.id);
  console.log("Email confirmed:", supabaseUser.email_confirmed_at ? "yes" : "no");

  const appUser = await prisma.appUser.findUnique({ where: { email } });
  if (!appUser) {
    console.log("\nFAIL: No AppUser row in database. Run npm run auth:bootstrap");
    return;
  }
  console.log("\nAppUser id:", appUser.id);
  console.log("AppUser role:", appUser.role);
  console.log("AppUser isActive:", appUser.isActive);
  console.log("AppUser authId:", appUser.authId);

  if (appUser.authId !== supabaseUser.id) {
    console.log("\nFAIL: authId mismatch — fixing would require updating AppUser.authId");
    console.log("  Supabase:", supabaseUser.id);
    console.log("  Prisma:  ", appUser.authId);
  } else {
    console.log("\nOK: authId matches Supabase user");
  }

  const anon = createClient(url, anonKey);
  const { data: signInData, error: signInError } = await anon.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.log("\nFAIL: Supabase signInWithPassword:", signInError.message);
    console.log("  → Password in .env.local does NOT match Supabase. Run npm run auth:reset-password");
    return;
  }

  console.log("\nOK: Supabase signInWithPassword succeeded");
  console.log("Session user id:", signInData.user?.id);
  await anon.auth.signOut();
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
