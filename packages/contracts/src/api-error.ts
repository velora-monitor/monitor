import { z } from "zod";

export const apiErrorSchema = z.object({
  error: z.string().min(1),
  message: z.string(),
  status: z.int().min(400).max(599),
});

export type ApiError = z.infer<typeof apiErrorSchema>;
