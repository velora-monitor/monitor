import { expect, test } from "@playwright/test";

test("dashboard shows the shell heading and chart", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { level: 1, name: "Velora" })).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
});
