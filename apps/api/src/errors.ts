import { apiErrorSchema, type ApiError } from "@velora/contracts";

export function apiError(
  status: 400 | 401 | 404 | 429 | 500,
  error: string,
  message: string,
): ApiError {
  return apiErrorSchema.parse({ error, message, status });
}
