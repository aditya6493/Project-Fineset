const LOWER = "abcdefghjkmnpqrstuvwxyz";
const UPPER = "ABCDEFGHJKMNPQRSTUVWXYZ";
const DIGITS = "23456789";
const SPECIAL = "!@#$%&*";
const ALL = LOWER + UPPER + DIGITS + SPECIAL;

function pickChar(pool: string): string {
  const index = crypto.getRandomValues(new Uint32Array(1))[0]! % pool.length;
  return pool.charAt(index);
}

function shuffle(values: string[]): string[] {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0]! % (i + 1);
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

/** Generates a password that satisfies {@link passwordPolicySchema}. */
export function generateSecurePassword(length = 16): string {
  const size = Math.max(12, length);
  const required = [pickChar(LOWER), pickChar(UPPER), pickChar(DIGITS), pickChar(SPECIAL)];
  const remaining = Array.from({ length: size - required.length }, () => pickChar(ALL));
  return shuffle([...required, ...remaining]).join("");
}
