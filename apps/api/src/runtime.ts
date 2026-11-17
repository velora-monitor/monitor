import { createAuthClient, unconfiguredAuth } from "./auth.js";
import { createApp } from "./app.js";
import { readConfig } from "./config.js";
import { createDatabase } from "./db/client.js";
import { createLogger } from "./logger.js";
import { initSentry } from "./sentry.js";

export function createRuntime(env: NodeJS.ProcessEnv) {
  const config = readConfig(env);
  const sentry = initSentry(config.sentryDsn);
  const logger = createLogger();
  const store = createDatabase(config.databaseUrl);
  const auth =
    config.supabaseUrl !== undefined && config.supabaseAnonKey !== undefined
      ? createAuthClient(config.supabaseUrl, config.supabaseAnonKey)
      : unconfiguredAuth();
  const app = createApp({
    auth,
    store,
    logger,
    trustProxy: config.trustProxy,
    sentry,
    rateLimit: { limit: 60, windowMs: 60_000 },
  });
  return { app, port: config.port, logger, sentry };
}
