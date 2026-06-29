import { test, expect } from "@playwright/test";

test.describe("Smoke: Landing Page", () => {
  test("app loads on landing page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Nexus Talent/);
  });
});
