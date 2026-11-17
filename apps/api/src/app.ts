import { Hono } from "hono";
import type { AppDependencies, AppEnv } from "./dependencies.js";
import { apiError } from "./errors.js";
import { requestLogger } from "./middleware.js";
import { createRateLimit } from "./rate-limit.js";
import { healthRoutes } from "./routes/health.js";
import { v1Routes } from "./routes/v1.js";

export function createApp(deps: AppDependencies) {
  const app = new Hono<AppEnv>()
    .use(requestLogger(deps.logger))
    .use(
      createRateLimit({
        limit: deps.rateLimit.limit,
        windowMs: deps.rateLimit.windowMs,
        trustProxy: deps.trustProxy,
        now: deps.rateLimit.now ?? Date.now,
      }),
    )
    .route("/", healthRoutes(deps))
    .route("/v1", v1Routes(deps));

  app.onError((error, c) => {
    deps.sentry.captureException(error);
    deps.logger.error({ err: error }, "request failed");
    return c.json(apiError(500, "internal_error", "Internal server error"), 500);
  });

  app.notFound((c) => c.json(apiError(404, "not_found", "Not found"), 404));

  return app;
}

export type AppType = ReturnType<typeof createApp>;
