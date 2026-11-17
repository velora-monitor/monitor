import type { MiddlewareHandler } from "hono";
import { apiError } from "./errors.js";
import { clientIp } from "./client-ip.js";
import type { AppEnv } from "./dependencies.js";

type Bucket = {
  count: number;
  resetAt: number;
};

export type RateLimitMiddlewareOptions = {
  limit: number;
  windowMs: number;
  trustProxy: boolean;
  now: () => number;
};

export function createRateLimit(options: RateLimitMiddlewareOptions): MiddlewareHandler<AppEnv> {
  const buckets = new Map<string, Bucket>();
  return async (c, next) => {
    const now = options.now();
    const ip = clientIp(c, options.trustProxy);
    const existing = buckets.get(ip);
    const bucket =
      existing && now < existing.resetAt ? existing : { count: 0, resetAt: now + options.windowMs };

    if (bucket.count >= options.limit) {
      buckets.set(ip, bucket);
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      c.header("Retry-After", String(retryAfter));
      return c.json(apiError(429, "rate_limited", "Too many requests"), 429);
    }

    bucket.count += 1;
    buckets.set(ip, bucket);
    await next();
    return c.res;
  };
}
