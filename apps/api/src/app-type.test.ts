import { hc } from "hono/client";
import { expectTypeOf, test } from "vitest";
import type { AppType } from "./app.js";

test("AppType is the Hono RPC type", () => {
  const client = hc<AppType>("http://localhost");
  expectTypeOf(client.health.$get).toBeFunction();
  expectTypeOf(client.v1.monitors.$get).toBeFunction();
  expectTypeOf(client.v1.incidents.$get).toBeFunction();
});
