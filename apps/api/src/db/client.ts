import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { authUsers, checkResults, incidents, monitors } from "./schema.js";

export type MonitorStore = {
  ping: () => Promise<void>;
  listMonitors: (ownerId: string) => Promise<unknown>;
  listIncidents: (ownerId: string, monitorId: string | undefined) => Promise<unknown>;
};

export function createDatabase(databaseUrl: string | undefined): MonitorStore | null {
  if (!databaseUrl) {
    return null;
  }

  const client = postgres(databaseUrl, { max: 1, connect_timeout: 5 });
  const db = drizzle(client, { schema: { authUsers, monitors, checkResults, incidents } });

  return {
    async ping() {
      await db.execute(sql`select 1`);
    },
    async listMonitors(ownerId) {
      const rows = await db.select().from(monitors).where(eq(monitors.ownerId, ownerId));
      return rows.map((row) => ({
        id: row.id,
        ownerId: row.ownerId,
        name: row.name,
        url: row.url,
        intervalSeconds: row.intervalSeconds,
        failureThreshold: row.failureThreshold,
        enabled: row.enabled,
        consecutiveFailures: row.consecutiveFailures,
        openIncidentId: row.openIncidentId,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      }));
    },
    async listIncidents(ownerId, monitorId) {
      const ownerMatch = eq(monitors.ownerId, ownerId);
      const where =
        monitorId === undefined ? ownerMatch : and(ownerMatch, eq(incidents.monitorId, monitorId));
      const rows = await db
        .select({
          id: incidents.id,
          monitorId: incidents.monitorId,
          state: incidents.state,
          openedAt: incidents.openedAt,
          resolvedAt: incidents.resolvedAt,
          failureCount: incidents.failureCount,
        })
        .from(incidents)
        .innerJoin(monitors, eq(incidents.monitorId, monitors.id))
        .where(where);
      return rows.map((row) => ({
        id: row.id,
        monitorId: row.monitorId,
        state: row.state,
        openedAt: row.openedAt.toISOString(),
        resolvedAt: row.resolvedAt ? row.resolvedAt.toISOString() : null,
        failureCount: row.failureCount,
      }));
    },
  };
}
