import type { AuthClient } from "./auth.js";
import { createApp } from "./app.js";
import type { MonitorStore } from "./db/client.js";
import type { AppDependencies } from "./dependencies.js";
import type { AppLogger } from "./logger.js";
import { initSentry } from "./sentry.js";

export function silentLogger(): AppLogger {
  return {
    info() {},
    error() {},
  };
}

export function acceptingAuth(getUser?: AuthClient["auth"]["getUser"]): AuthClient {
  return {
    auth: {
      getUser:
        getUser ??
        (async () => ({
          data: { user: { id: "5f0b0b3e-1c3a-4a3e-9e2a-0d5a1a2b3c4d" } },
          error: null,
        })),
    },
  };
}

export function emptyStore(ping: () => Promise<void> = async () => {}): MonitorStore {
  return {
    ping,
    async listMonitors() {
      return [];
    },
    async listIncidents() {
      return [];
    },
  };
}

export function createTestApp(overrides: Partial<AppDependencies> = {}) {
  return createApp({
    auth: overrides.auth ?? acceptingAuth(),
    store: overrides.store ?? null,
    logger: overrides.logger ?? silentLogger(),
    trustProxy: overrides.trustProxy ?? false,
    sentry: overrides.sentry ?? initSentry(undefined),
    rateLimit: overrides.rateLimit ?? { limit: 100, windowMs: 60_000 },
  });
}
