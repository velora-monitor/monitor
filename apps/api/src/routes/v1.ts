import { incidentSchema, monitorSchema } from "@velora/contracts";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { AppDependencies, AppEnv } from "../dependencies.js";
import { requireUser } from "../middleware.js";
import { validationHook } from "../validation.js";

const incidentQuerySchema = incidentSchema.pick({ monitorId: true }).partial();

export function v1Routes(deps: AppDependencies) {
  return new Hono<AppEnv>()
    .use(requireUser(deps.auth))
    .get("/monitors", async (c) => {
      const rows = deps.store ? await deps.store.listMonitors(c.get("userId")) : [];
      return c.json(monitorSchema.array().parse(rows));
    })
    .get("/incidents", zValidator("query", incidentQuerySchema, validationHook), async (c) => {
      const monitorId = c.req.valid("query").monitorId;
      const rows = deps.store ? await deps.store.listIncidents(c.get("userId"), monitorId) : [];
      return c.json(incidentSchema.array().parse(rows));
    });
}
