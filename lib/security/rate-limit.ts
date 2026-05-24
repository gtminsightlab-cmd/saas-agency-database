/**
 * Rate-limiting wrapper. Backed by Upstash Redis (sliding-window).
 *
 * Graceful no-op when UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are
 * unset — local development without Redis returns `{ success: true }` so
 * call sites don't need conditional logic. In production these env vars
 * MUST be set (Master O dashboard action: create Upstash Redis DB, paste
 * URL + token into Vercel env vars).
 *
 * Usage in an API route:
 *
 *   import { checkRateLimit, ipFromHeaders } from "@/lib/security/rate-limit";
 *
 *   const { success, reset } = await checkRateLimit("invite", `invite:${user.id}`);
 *   if (!success) {
 *     return NextResponse.json(
 *       { message: "Too many requests. Try again shortly." },
 *       { status: 429, headers: { "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)) } }
 *     );
 *   }
 *
 * Limiter keys (add new ones to LIMITER_CONFIG below as needed):
 *   - "invite":      10 / hour per user — team-invite POSTs
 *   - "adminWrite":  30 / minute per user — admin-* mutating endpoints
 *   - "publicWrite": 20 / hour per IP    — unauthenticated public-write endpoints
 *   - "generic":     60 / minute per identifier — fallback
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

// Single Redis client — Upstash REST is HTTP-based so no connection pool needed.
const redis = url && token ? new Redis({ url, token }) : null;

type WindowSpec = `${number} ${"s" | "m" | "h" | "d"}`;

type LimiterConfig = { limit: number; window: WindowSpec };

const LIMITER_CONFIG = {
  invite:       { limit: 10, window: "1 h"  satisfies WindowSpec } as LimiterConfig,
  adminWrite:   { limit: 30, window: "1 m"  satisfies WindowSpec } as LimiterConfig,
  publicWrite:  { limit: 20, window: "1 h"  satisfies WindowSpec } as LimiterConfig,
  generic:      { limit: 60, window: "1 m"  satisfies WindowSpec } as LimiterConfig,
} as const;

export type LimiterKey = keyof typeof LIMITER_CONFIG;

const limiters: Partial<Record<LimiterKey, Ratelimit>> = {};

function getLimiter(key: LimiterKey): Ratelimit | null {
  if (!redis) return null;
  if (limiters[key]) return limiters[key]!;
  const cfg = LIMITER_CONFIG[key];
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(cfg.limit, cfg.window),
    analytics: true,
    prefix: `rl:${key}`,
  });
  limiters[key] = limiter;
  return limiter;
}

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  reset: number;
  limit: number;
};

/**
 * Check rate limit for a given limiter key + identifier. Returns success=true
 * (and Infinity remaining) when Redis is not configured — local dev path.
 */
export async function checkRateLimit(
  key: LimiterKey,
  identifier: string
): Promise<RateLimitResult> {
  const limiter = getLimiter(key);
  if (!limiter) {
    return { success: true, remaining: Infinity, reset: 0, limit: Infinity };
  }
  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
    limit: result.limit,
  };
}

/**
 * Extract a best-effort IP from request headers (Vercel-aware). Returns
 * "unknown" when no header is present — prefer this to throwing so rate
 * limiting falls back to a single bucket rather than 500-ing.
 */
export function ipFromHeaders(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Convenience helper — returns the standard NextResponse.json args for a 429.
 * Caller still owns the actual NextResponse construction so they can add
 * extra context (logger, error id, etc.) before returning.
 */
export function rateLimitErrorResponse(result: RateLimitResult) {
  const retryAfterSec = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
  return {
    body: {
      message: "Too many requests. Try again shortly.",
      retryAfterSec,
    },
    init: {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSec),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(result.reset),
      },
    },
  } as const;
}
