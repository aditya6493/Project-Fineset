/** Bcrypt hashes contain `$`, which Next.js/dotenv corrupt via variable expansion. Store base64 instead. */
export function getAdminPasswordHash(): string | null {
  const raw = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (!raw) return null;

  if (raw.startsWith("$2")) return raw;

  try {
    const decoded = Buffer.from(raw, "base64").toString("utf8");
    return decoded.startsWith("$2") ? decoded : null;
  } catch {
    return null;
  }
}
