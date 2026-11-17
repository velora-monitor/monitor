import type { AuthClient } from "./auth.js";
import type { MonitorStore } from "./db/client.js";
import type { AppLogger } from "./logger.js";
import type { SentryClient } from "./sentry.js";

export type AppEnv = {
  Variables: {
    userId: string;
  };
};

export type RateLimitOptions = {
  limit: number;
  windowMs: number;
  now?: () => number;
};

export type AppDependencies = {
  auth: AuthClient;
  store: MonitorStore | null;
  logger: AppLogger;
  trustProxy: boolean;
  sentry: SentryClient;
  rateLimit: RateLimitOptions;
};
