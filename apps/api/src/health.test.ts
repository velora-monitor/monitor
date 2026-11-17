import { healthSchema } from "@velora/contracts";
import { expect, test } from "vitest";
import { createTestApp, emptyStore } from "./test-utils.js";

test("health reports an unconfigured database", async () => {
  const app = createTestApp();
  const response = await app.request("/health");
  expect(response.status).toBe(200);
  expect(healthSchema.parse(await response.json())).toEqual({
    status: "ok",
    database: "unconfigured",
  });
});

test("health reports the database up when the probe succeeds", async () => {
  const app = createTestApp({ store: emptyStore() });
  const response = await app.request("/health");
  expect(healthSchema.parse(await response.json())).toEqual({ status: "ok", database: "up" });
});

test("health reports the database down when the probe fails", async () => {
  const app = createTestApp({
    store: emptyStore(async () => {
      throw new Error("database unavailable");
    }),
  });
  const response = await app.request("/health");
  expect(healthSchema.parse(await response.json())).toEqual({ status: "ok", database: "down" });
});
