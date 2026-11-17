import { z } from "zod";

export const healthDatabaseSchema = z.enum(["unconfigured", "up", "down"]);

export const healthSchema = z.object({
  status: z.literal("ok"),
  database: healthDatabaseSchema,
});

export type HealthDatabase = z.infer<typeof healthDatabaseSchema>;
export type Health = z.infer<typeof healthSchema>;
