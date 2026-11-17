import { apiErrorSchema } from "@velora/contracts";
import { expect, test } from "vitest";
import { createTestApp, emptyStore } from "./test-utils.js";

const headers = { authorization: "Bearer test-token" };

test("rejects an incident query that fails the contract schema", async () => {
  const app = createTestApp();
  const response = await app.request("/v1/incidents?monitorId=not-a-uuid", { headers });
  expect(response.status).toBe(400);
  expect(apiErrorSchema.parse(await response.json())).toMatchObject({
    error: "invalid_request",
    status: 400,
  });
});

test("accepts an incident query that matches the contract schema", async () => {
  const app = createTestApp();
  const response = await app.request(
    "/v1/incidents?monitorId=5f0b0b3e-1c3a-4a3e-9e2a-0d5a1a2b3c4d",
    { headers },
  );
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual([]);
});

test("rejects monitor rows that fail the contract schema", async () => {
  const app = createTestApp({
    store: {
      ...emptyStore(),
      async listMonitors() {
        return [{ id: "nope" }];
      },
    },
  });
  const response = await app.request("/v1/monitors", { headers });
  expect(response.status).toBe(500);
  expect(apiErrorSchema.parse(await response.json())).toMatchObject({
    error: "internal_error",
    status: 500,
  });
});
