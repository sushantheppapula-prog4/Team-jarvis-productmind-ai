import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { LRUCache } from "lru-cache";
import { headers } from "next/headers";

type RateLimitContext = {
  ip: string;
  userId?: string;
};

// Fallback in-memory cache if Redis is not configured
const fallbackCache = new LRUCache<string, number>({
  max: 10000,
  ttl: 60 * 1000, // 1 minute
});

const getRedisClient = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return new Redis({ url, token });
  }
  return null;
};

const redis = getRedisClient();

export async function getRateLimitContext(): Promise<RateLimitContext> {
  const headersList = await headers();
  // Attempt to get real IP from standard proxy headers
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] ||
             headersList.get("x-real-ip") ||
             "127.0.0.1";
  
  return { ip };
}

export type RateLimitAction = "login" | "signup" | "upload" | "ai_analysis" | "reports";

export async function checkRateLimit(
  action: RateLimitAction,
  context: RateLimitContext
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const identifier = context.userId ? `${action}:user:${context.userId}` : `${action}:ip:${context.ip}`;

  // If Redis is not configured, use simple memory fallback (warn in dev)
  if (!redis) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`Upstash Redis not configured. Using fallback memory rate limiter for ${identifier}`);
    }
    return checkFallbackRateLimit(action, identifier);
  }

  let limit = 10;
  let window = "10 s";

  switch (action) {
    case "login":
    case "signup":
      // Strict limit for auth: 5 requests per minute
      limit = 5;
      window = "1 m";
      break;
    case "upload":
      // Upload limits: 10 per minute to prevent storage spam
      limit = 10;
      window = "1 m";
      break;
    case "ai_analysis":
      // AI calls are expensive: 20 per hour per user
      limit = 20;
      window = "1 h";
      break;
    case "reports":
      // Report generation: 30 per hour
      limit = 30;
      window = "1 h";
      break;
  }

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window as any),
    analytics: true,
    prefix: "@upstash/ratelimit",
  });

  const { success, limit: resLimit, remaining, reset } = await ratelimit.limit(identifier);

  return {
    success,
    limit: resLimit,
    remaining,
    reset,
  };
}

// Very basic fallback memory rate limit
async function checkFallbackRateLimit(
  action: RateLimitAction,
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  let limit = 10;
  let ttl = 10000;

  switch (action) {
    case "login":
    case "signup":
      limit = 5;
      ttl = 60000;
      break;
    case "upload":
      limit = 10;
      ttl = 60000;
      break;
    case "ai_analysis":
      limit = 20;
      ttl = 3600000;
      break;
    case "reports":
      limit = 30;
      ttl = 3600000;
      break;
  }

  const now = Date.now();
  const reset = now + ttl;

  // This is a naive implementation just for fallback
  const cacheKey = `${identifier}:${Math.floor(now / ttl)}`;
  const current = (fallbackCache.get(cacheKey) || 0) + 1;
  fallbackCache.set(cacheKey, current, { ttl });

  return {
    success: current <= limit,
    limit,
    remaining: Math.max(0, limit - current),
    reset,
  };
}
