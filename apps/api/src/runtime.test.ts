import { expect, test, vi } from "vitest";

vi.mock("./email.js", () => ({
  createEmailSender() {
    throw new Error("Resend factory called");
  },
}));

import { createRuntime } from "./runtime.js";

test("startup does not call the resend factory", async () => {
  const runtime = createRuntime({});
  const response = await runtime.app.request("/health");
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ status: "ok", database: "unconfigured" });
  expect(runtime.sentry.enabled).toBe(false);
});
