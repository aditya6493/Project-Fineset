import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { isProduction } from "@/lib/env";

type RateLimitResult =
  | { success: true }
  | { success: false; retryAfterSeconds: number };

function isNextBuild(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (
      isProduction() &&
      !isNextBuild() &&
      process.env.SKIP_ENV_VALIDATION !== "true"
    ) {
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

let loginLimiter: Ratelimit | null | undefined;
let writeLimiter: Ratelimit | null | undefined;
let sseLimiter: Ratelimit | null | undefined;

function getLoginLimiter(): Ratelimit | null {
  loginLimiter ??= createLimiter("fineset:login", 10, "15 m");
  return loginLimiter;
}

function getWriteLimiter(): Ratelimit | null {
  writeLimiter ??= createLimiter("fineset:write", 60, "15 m");
  return writeLimiter;
}

function getSseLimiter(): Ratelimit | null {
  sseLimiter ??= createLimiter("fineset:sse", 30, "15 m");
  return sseLimiter;
}

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
  return checkLimit(getLoginLimiter(), identifier);
}

export async function checkWriteRateLimit(
  identifier: string,
): Promise<RateLimitResult> {
  return checkLimit(getWriteLimiter(), identifier);
}

export async function checkSseRateLimit(
  identifier: string,
): Promise<RateLimitResult> {
  return checkLimit(getSseLimiter(), identifier);
}

export async function getRequestIdentifier(): Promise<string> {
  const { headers } = await import("next/headers");
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  return ip;
}
