import { type SQLWrapper, sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  check,
  index,
  integer,
  pgPolicy,
  pgSchema,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const authSchema = pgSchema("auth");

export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

const timestamptz = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

function monitorOwnership(monitorId: SQLWrapper) {
  return sql`exists (
    select 1
    from public.monitors
    where public.monitors.id = ${monitorId}
      and public.monitors.owner_id = auth.uid()
  )`;
}

export const monitors = pgTable(
  "monitors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    url: text("url").notNull(),
    intervalSeconds: integer("interval_seconds").notNull(),
    failureThreshold: integer("failure_threshold").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    consecutiveFailures: integer("consecutive_failures").notNull().default(0),
    openIncidentId: uuid("open_incident_id").references((): AnyPgColumn => incidents.id, {
      onDelete: "set null",
    }),
    createdAt: timestamptz("created_at").notNull().defaultNow(),
    updatedAt: timestamptz("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("monitors_owner_id_idx").on(table.ownerId),
    check("monitors_name_check", sql`char_length(${table.name}) > 0`),
    check("monitors_url_check", sql`char_length(${table.url}) > 0`),
    check("monitors_interval_seconds_check", sql`${table.intervalSeconds} > 0`),
    check("monitors_failure_threshold_check", sql`${table.failureThreshold} >= 1`),
    check("monitors_consecutive_failures_check", sql`${table.consecutiveFailures} >= 0`),
    pgPolicy("monitors_select_own", {
      for: "select",
      to: "authenticated",
      using: sql`${table.ownerId} = auth.uid()`,
    }),
    pgPolicy("monitors_insert_own", {
      for: "insert",
      to: "authenticated",
      withCheck: sql`${table.ownerId} = auth.uid()`,
    }),
    pgPolicy("monitors_update_own", {
      for: "update",
      to: "authenticated",
      using: sql`${table.ownerId} = auth.uid()`,
      withCheck: sql`${table.ownerId} = auth.uid()`,
    }),
    pgPolicy("monitors_delete_own", {
      for: "delete",
      to: "authenticated",
      using: sql`${table.ownerId} = auth.uid()`,
    }),
  ],
).enableRLS();

export const checkResults = pgTable(
  "check_results",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    monitorId: uuid("monitor_id")
      .notNull()
      .references(() => monitors.id, { onDelete: "cascade" }),
    status: text("status").notNull(),
    statusCode: integer("status_code"),
    latencyMs: integer("latency_ms"),
    error: text("error"),
    checkedAt: timestamptz("checked_at").notNull().defaultNow(),
  },
  (table) => [
    index("check_results_monitor_id_checked_at_idx").on(table.monitorId, table.checkedAt.desc()),
    check("check_results_status_check", sql`${table.status} in ('up', 'down')`),
    check(
      "check_results_status_code_check",
      sql`${table.statusCode} is null or ${table.statusCode} between 100 and 599`,
    ),
    check(
      "check_results_latency_ms_check",
      sql`${table.latencyMs} is null or ${table.latencyMs} >= 0`,
    ),
    pgPolicy("check_results_select_own", {
      for: "select",
      to: "authenticated",
      using: monitorOwnership(table.monitorId),
    }),
    pgPolicy("check_results_insert_own", {
      for: "insert",
      to: "authenticated",
      withCheck: monitorOwnership(table.monitorId),
    }),
    pgPolicy("check_results_update_own", {
      for: "update",
      to: "authenticated",
      using: monitorOwnership(table.monitorId),
      withCheck: monitorOwnership(table.monitorId),
    }),
    pgPolicy("check_results_delete_own", {
      for: "delete",
      to: "authenticated",
      using: monitorOwnership(table.monitorId),
    }),
  ],
).enableRLS();

export const incidents = pgTable(
  "incidents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    monitorId: uuid("monitor_id")
      .notNull()
      .references((): AnyPgColumn => monitors.id, { onDelete: "cascade" }),
    state: text("state").notNull(),
    openedAt: timestamptz("opened_at").notNull().defaultNow(),
    resolvedAt: timestamptz("resolved_at"),
    failureCount: integer("failure_count").notNull().default(0),
  },
  (table) => [
    index("incidents_monitor_id_state_idx").on(table.monitorId, table.state),
    uniqueIndex("incidents_one_open_per_monitor_idx")
      .on(table.monitorId)
      .where(sql`${table.state} = 'open'`),
    check("incidents_state_check", sql`${table.state} in ('open', 'resolved')`),
    check("incidents_failure_count_check", sql`${table.failureCount} >= 0`),
    check(
      "incidents_resolved_at_check",
      sql`(${table.state} = 'open' and ${table.resolvedAt} is null) or (${table.state} = 'resolved' and ${table.resolvedAt} is not null)`,
    ),
    pgPolicy("incidents_select_own", {
      for: "select",
      to: "authenticated",
      using: monitorOwnership(table.monitorId),
    }),
    pgPolicy("incidents_insert_own", {
      for: "insert",
      to: "authenticated",
      withCheck: monitorOwnership(table.monitorId),
    }),
    pgPolicy("incidents_update_own", {
      for: "update",
      to: "authenticated",
      using: monitorOwnership(table.monitorId),
      withCheck: monitorOwnership(table.monitorId),
    }),
    pgPolicy("incidents_delete_own", {
      for: "delete",
      to: "authenticated",
      using: monitorOwnership(table.monitorId),
    }),
  ],
).enableRLS();
