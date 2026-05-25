import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitResult =
  | { success: true }
  | { success: false; retryAfterSeconds: number };

function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
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
const aiInsightsLimiter = createLimiter("fineset:ai-insights", 20, "1 h");

export async function checkLoginRateLimit(
  identifier: string,
): Promise<RateLimitResult> {
  if (!loginLimiter) return { success: true };

  const result = await loginLimiter.limit(identifier);
  if (result.success) return { success: true };

  return {
    success: false,
    retryAfterSeconds: Math.ceil((result.reset - Date.now()) / 1000),
  };
}

export async function checkAiInsightsRateLimit(
  identifier: string,
): Promise<RateLimitResult> {
  if (!aiInsightsLimiter) return { success: true };

  const result = await aiInsightsLimiter.limit(identifier);
  if (result.success) return { success: true };

  return {
    success: false,
    retryAfterSeconds: Math.ceil((result.reset - Date.now()) / 1000),
  };
}

export async function getRequestIdentifier(): Promise<string> {
  const { headers } = await import("next/headers");
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  return ip;
}
