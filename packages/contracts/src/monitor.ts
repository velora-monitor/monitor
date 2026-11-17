import { z } from "zod";

export const monitorSchema = z.object({
  id: z.uuid(),
  ownerId: z.uuid(),
  name: z.string().min(1),
  url: z.url(),
  intervalSeconds: z.int().positive(),
  failureThreshold: z.int().min(1),
  enabled: z.boolean(),
  consecutiveFailures: z.int().nonnegative(),
  openIncidentId: z.uuid().nullable(),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
});

export type Monitor = z.infer<typeof monitorSchema>;
