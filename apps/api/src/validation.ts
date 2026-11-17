import type { Context } from "hono";
import { apiError } from "./errors.js";

type ValidationResult =
  | { success: true }
  | { success: false; error: { issues: readonly { message: string }[] } };

export function validationHook(result: ValidationResult, c: Context) {
  if (result.success) {
    return undefined;
  }

  const issue = result.error.issues[0];
  const message = issue ? issue.message : "Invalid request";
  return c.json(apiError(400, "invalid_request", message), 400);
}
