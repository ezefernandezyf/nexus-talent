import { test, expect } from "@playwright/test";
import { registerAndLogin } from "../helpers/auth";

test.describe("Auth — Logout", () => {
  test("login then logout via browser button", async ({ page }) => {
    const email = `e2e-logout-${Date.now()}@test.dev`;
    const password = "Test1234!";

    // Arrange — login via browser registration
    await registerAndLogin(page, email, password);
    await expect(page).toHaveURL(/\/app\/analysis/);

    // Act — click logout button
    await page.click('button[aria-label="Abrir acciones de cuenta"]');
    await page.click('[data-testid="logout-button"]');

    // Assert — redirected to sign-in page
    await expect(page).toHaveURL("/auth/sign-in");
    await expect(page.locator("text=Iniciá sesión")).toBeVisible();
  });
});
