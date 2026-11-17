import { expect, test, vi } from "vitest";
import { createTestApp } from "./test-utils.js";

test("returns 401 without a bearer token", async () => {
  const getUser = vi.fn();
  const app = createTestApp({
    auth: {
      auth: { getUser },
    },
  });

  const monitors = await app.request("/v1/monitors");
  const incidents = await app.request("/v1/incidents");

  expect(monitors.status).toBe(401);
  expect(incidents.status).toBe(401);
  expect(await monitors.json()).toMatchObject({ error: "unauthorized", status: 401 });
  expect(await incidents.json()).toMatchObject({ error: "unauthorized", status: 401 });
  expect(getUser).not.toHaveBeenCalled();
});

test("calls getUser and returns empty lists when the database is unconfigured", async () => {
  const getUser = vi.fn(async () => ({
    data: { user: { id: "5f0b0b3e-1c3a-4a3e-9e2a-0d5a1a2b3c4d" } },
    error: null,
  }));
  const app = createTestApp({
    auth: { auth: { getUser } },
    store: null,
  });
  const headers = { authorization: "Bearer test-token" };

  const monitors = await app.request("/v1/monitors", { headers });
  const incidents = await app.request("/v1/incidents", { headers });

  expect(monitors.status).toBe(200);
  expect(incidents.status).toBe(200);
  expect(await monitors.json()).toEqual([]);
  expect(await incidents.json()).toEqual([]);
  expect(getUser).toHaveBeenCalledTimes(2);
  expect(getUser).toHaveBeenCalledWith("test-token");
});
