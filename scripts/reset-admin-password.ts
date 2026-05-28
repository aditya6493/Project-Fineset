/**
 * Reset MASTER_ADMIN password in Supabase Auth to match .env.local.
 *
 * Usage: npm run auth:reset-password
 * Requires: SUPABASE_SERVICE_ROLE_KEY, MASTER_ADMIN_EMAIL, MASTER_ADMIN_PASSWORD
 */
import { createAdminClient } from "../lib/supabase/admin";
import { validatePassword } from "../lib/auth/password-policy";

async function main(): Promise<void> {
  const email = process.env.MASTER_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.MASTER_ADMIN_PASSWORD?.trim();

  if (!email || !password) {
    throw new Error(
      "Set MASTER_ADMIN_EMAIL and MASTER_ADMIN_PASSWORD in .env.local",
    );
  }

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.success) {
    throw new Error(passwordCheck.error ?? "Invalid password");
  }

  const supabase = createAdminClient();
  const { data: listData, error: listError } =
    await supabase.auth.admin.listUsers();
  if (listError) throw listError;

  const user = listData.users.find((u) => u.email?.toLowerCase() === email);
  if (!user) {
    throw new Error(
      `No Supabase user for ${email}. Run npm run auth:bootstrap first.`,
    );
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { password },
  );
  if (updateError) throw updateError;

  console.log(`Password updated for ${email}`);
  console.log("Sign in on /login with MASTER_ADMIN_PASSWORD from .env.local");
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
