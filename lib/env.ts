import { z } from "zod";

/** Treat empty .env values as unset — dotenv loads "" instead of undefined. */
function optionalEnv<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    schema,
  );
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: optionalEnv(z.string().min(1).optional()),
  NEXT_PUBLIC_SUPABASE_URL: optionalEnv(z.string().url().optional()),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalEnv(z.string().min(1).optional()),
  SUPABASE_SERVICE_ROLE_KEY: optionalEnv(z.string().min(1).optional()),
  NEXT_PUBLIC_APP_URL: optionalEnv(z.string().url().optional()),
  AUTH_SECRET: optionalEnv(z.string().min(1).optional()),
  NEXTAUTH_SECRET: optionalEnv(z.string().min(1).optional()),
  ENCRYPTION_KEY: optionalEnv(z.string().length(64).optional()),
  UPSTASH_REDIS_REST_URL: optionalEnv(z.string().url().optional()),
  UPSTASH_REDIS_REST_TOKEN: optionalEnv(z.string().min(1).optional()),
  MASTER_ADMIN_EMAIL: optionalEnv(z.string().email().optional()),
  MASTER_ADMIN_PASSWORD: optionalEnv(z.string().min(8).optional()),
  MASTER_ADMIN_NAME: optionalEnv(z.string().min(1).optional()),
  SKIP_ENV_VALIDATION: optionalEnv(z.string().optional()),
});

export type Env = z.infer<typeof envSchema>;

let validated = false;

export function validateEnv(): void {
  if (validated) return;
  if (process.env.SKIP_ENV_VALIDATION === "true") {
    validated = true;
    return;
  }

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid environment variables:", result.error.flatten().fieldErrors);
    throw new Error("Environment validation failed");
  }

  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    const missing: string[] = [];

    if (!process.env.DATABASE_URL) missing.push("DATABASE_URL");
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      missing.push("NEXT_PUBLIC_SUPABASE_URL");
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      missing.push("SUPABASE_SERVICE_ROLE_KEY");
    }
    if (!process.env.ENCRYPTION_KEY) missing.push("ENCRYPTION_KEY");
    if (!process.env.UPSTASH_REDIS_REST_URL) missing.push("UPSTASH_REDIS_REST_URL");
    if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
      missing.push("UPSTASH_REDIS_REST_TOKEN");
    }

    if (missing.length > 0) {
      throw new Error(
        `Missing required production environment variables: ${missing.join(", ")}`,
      );
    }
  }

  validated = true;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
