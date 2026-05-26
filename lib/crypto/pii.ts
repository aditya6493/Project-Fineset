import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { isProduction } from "@/lib/env";

const ALGORITHM = "aes-256-gcm";
const PREFIX = "enc:";

function getEncryptionKey(): Buffer | null {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length < 64) {
    if (isProduction()) {
      throw new Error("ENCRYPTION_KEY is required in production");
    }
    return null;
  }
  return Buffer.from(key.slice(0, 64), "hex");
}

export function hashPhone(phone: string): string {
  const normalized = phone.replace(/\D/g, "");
  return createHash("sha256").update(normalized).digest("hex");
}

export function encryptPii(value: string): string {
  const key = getEncryptionKey();
  if (!key) return value;

  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptPii(value: string): string {
  if (!value.startsWith(PREFIX)) return value;

  const key = getEncryptionKey();
  if (!key) return value;

  const payload = value.slice(PREFIX.length);
  const [ivHex, authTagHex, encryptedHex] = payload.split(":");
  if (!ivHex || !authTagHex || !encryptedHex) return value;

  try {
    const decipher = createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(ivHex, "hex"),
    );
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, "hex")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch {
    return value;
  }
}

export function isEncryptionEnabled(): boolean {
  return getEncryptionKey() !== null;
}
