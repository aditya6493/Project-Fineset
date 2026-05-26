import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { isProduction } from "@/lib/env";

type RateLimitResult =
  | { success: true }
  | { success: false; retryAfterSeconds: number };

function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (isProduction() && process.env.SKIP_ENV_VALIDATION !== "true") {
      throw new Error(
        "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required in production",
      );
    }
    if (!isProduction()) {
      console.warn("[rate-limit] Upstash Redis not configured — rate limiting disabled in development");
    }
    return null;
  }
  return new Redis({ url, token });
}

function createLimiter(
  prefix: string,
  requests: number,
  window: `${number} ${"s" | "m" | "h" | "d"}`,
): Ratelimit | null {
  const redis = createRedisClient();
  if (!redis) return null;

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix,
    analytics: false,
  });
}

const loginLimiter = createLimiter("fineset:login", 10, "15 m");
const writeLimiter = createLimiter("fineset:write", 60, "15 m");
const sseLimiter = createLimiter("fineset:sse", 30, "15 m");

async function checkLimit(
  limiter: Ratelimit | null,
  identifier: string,
): Promise<RateLimitResult> {
  if (!limiter) return { success: true };

  const result = await limiter.limit(identifier);
  if (result.success) return { success: true };

  return {
    success: false,
    retryAfterSeconds: Math.ceil((result.reset - Date.now()) / 1000),
  };
}

export async function checkLoginRateLimit(
  identifier: string,
): Promise<RateLimitResult> {
  return checkLimit(loginLimiter, identifier);
}

export async function checkWriteRateLimit(
  identifier: string,
): Promise<RateLimitResult> {
  return checkLimit(writeLimiter, identifier);
}

export async function checkSseRateLimit(
  identifier: string,
): Promise<RateLimitResult> {
  return checkLimit(sseLimiter, identifier);
}

export async function getRequestIdentifier(): Promise<string> {
  const { headers } = await import("next/headers");
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  return ip;
}
