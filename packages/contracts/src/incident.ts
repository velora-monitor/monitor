import { z } from "zod";

export const incidentStateSchema = z.enum(["open", "resolved"]);

export const incidentSchema = z.object({
  id: z.uuid(),
  monitorId: z.uuid(),
  state: incidentStateSchema,
  openedAt: z.iso.datetime({ offset: true }),
  resolvedAt: z.iso.datetime({ offset: true }).nullable(),
  failureCount: z.int().nonnegative(),
});

export type IncidentState = z.infer<typeof incidentStateSchema>;
export type Incident = z.infer<typeof incidentSchema>;
