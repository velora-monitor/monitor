import { z } from "zod";

export const checkStatusSchema = z.enum(["up", "down"]);

export const checkResultSchema = z.object({
  id: z.uuid(),
  monitorId: z.uuid(),
  status: checkStatusSchema,
  statusCode: z.int().nullable(),
  latencyMs: z.int().nonnegative().nullable(),
  error: z.string().nullable(),
  checkedAt: z.iso.datetime({ offset: true }),
});

export type CheckStatus = z.infer<typeof checkStatusSchema>;
export type CheckResult = z.infer<typeof checkResultSchema>;
