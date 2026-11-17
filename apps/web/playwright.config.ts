import { defineConfig, devices } from "@playwright/test";

const port = 4317;
const baseURL = `http://127.0.0.1:${String(port)}`;
const desktopChrome = devices["Desktop Chrome"];

if (!desktopChrome) {
  throw new Error("Playwright is missing the Desktop Chrome device");
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: process.env["CI"] === "true",
  retries: 0,
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: `pnpm exec vite --host 127.0.0.1 --port ${String(port)} --strictPort`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...desktopChrome },
    },
  ],
});
