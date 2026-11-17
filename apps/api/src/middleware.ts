import type { MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";
import { readBearerToken, type AuthClient } from "./auth.js";
import type { AppEnv } from "./dependencies.js";
import { apiError } from "./errors.js";
import type { AppLogger } from "./logger.js";

export function requestLogger(logger: AppLogger): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const started = performance.now();
    await next();
    logger.info(
      {
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
        durationMs: Math.round(performance.now() - started),
      },
      "request",
    );
  };
}

export function requireUser(auth: AuthClient) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const token = readBearerToken(c.req.header("authorization"));
    if (!token) {
      return c.json(apiError(401, "unauthorized", "Missing bearer token"), 401);
    }

    const result = await auth.auth.getUser(token);
    if (result.error || !result.data.user) {
      return c.json(apiError(401, "unauthorized", "Invalid bearer token"), 401);
    }

    c.set("userId", result.data.user.id);
    await next();
    return c.res;
  });
}
