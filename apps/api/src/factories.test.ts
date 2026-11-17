import { expect, test, vi } from "vitest";
import { createEmailSender } from "./email.js";
import { initSentry } from "./sentry.js";

test("sentry init no-ops without a dsn", () => {
  const init = vi.fn();
  const sentry = initSentry(undefined, init);
  sentry.captureException(new Error("ignored"));
  expect(sentry.enabled).toBe(false);
  expect(init).not.toHaveBeenCalled();
});

test("sentry init uses the injected initializer when a dsn is set", () => {
  const init = vi.fn();
  const sentry = initSentry("https://public@sentry.example/1", init);
  expect(sentry.enabled).toBe(true);
  expect(init).toHaveBeenCalledWith({ dsn: "https://public@sentry.example/1" });
});

test("resend sender no-ops without an api key", async () => {
  const factory = vi.fn();
  const sender = createEmailSender(undefined, factory);
  await sender.send({ to: "person@example.com", subject: "Hi", text: "Hello" });
  expect(factory).not.toHaveBeenCalled();
});

test("resend sender uses the injected client when an api key is set", async () => {
  const send = vi.fn(async () => ({ id: "email" }));
  const factory = vi.fn(() => ({ emails: { send } }));
  const sender = createEmailSender("re_test", factory);
  await sender.send({ to: "person@example.com", subject: "Hi", text: "Hello" });
  expect(factory).toHaveBeenCalledWith("re_test");
  expect(send).toHaveBeenCalledWith({
    from: "Velora <alerts@velora.invalid>",
    to: "person@example.com",
    subject: "Hi",
    text: "Hello",
  });
});
