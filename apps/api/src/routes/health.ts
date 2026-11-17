import { healthSchema, type HealthDatabase } from "@velora/contracts";
import { Hono } from "hono";
import type { AppDependencies, AppEnv } from "../dependencies.js";
import type { MonitorStore } from "../db/client.js";

export function healthRoutes(deps: AppDependencies) {
  return new Hono<AppEnv>().get("/health", async (c) => {
    const database = await databaseStatus(deps.store);
    return c.json(healthSchema.parse({ status: "ok", database }));
  });
}

async function databaseStatus(store: MonitorStore | null): Promise<HealthDatabase> {
  if (!store) {
    return "unconfigured";
  }

  try {
    await store.ping();
    return "up";
  } catch {
    return "down";
  }
}
