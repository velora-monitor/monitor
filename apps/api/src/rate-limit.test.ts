import { expect, test } from "vitest";
import { createTestApp } from "./test-utils.js";

test("returns 429 after the client ip exceeds the window", async () => {
  const app = createTestApp({
    trustProxy: true,
    rateLimit: { limit: 1, windowMs: 60_000, now: () => 1_000 },
  });
  const headers = { "x-forwarded-for": "203.0.113.10" };
  const first = await app.request("/health", { headers });
  const second = await app.request("/health", { headers });
  expect(first.status).toBe(200);
  expect(second.status).toBe(429);
  expect(await second.json()).toMatchObject({ error: "rate_limited", status: 429 });
});

test("ignores X-Forwarded-For unless the proxy is trusted", async () => {
  const app = createTestApp({
    trustProxy: false,
    rateLimit: { limit: 1, windowMs: 60_000, now: () => 1_000 },
  });
  const first = await app.request("/health", {
    headers: { "x-forwarded-for": "203.0.113.10" },
  });
  const second = await app.request("/health", {
    headers: { "x-forwarded-for": "203.0.113.11" },
  });
  expect(first.status).toBe(200);
  expect(second.status).toBe(429);
});

test("tracks forwarded client ips separately when the proxy is trusted", async () => {
  const app = createTestApp({
    trustProxy: true,
    rateLimit: { limit: 1, windowMs: 60_000, now: () => 1_000 },
  });
  const first = await app.request("/health", {
    headers: { "x-forwarded-for": "203.0.113.10, 10.0.0.1" },
  });
  const second = await app.request("/health", {
    headers: { "x-forwarded-for": "203.0.113.11" },
  });
  expect(first.status).toBe(200);
  expect(second.status).toBe(200);
});
