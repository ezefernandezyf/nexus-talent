import { test, expect } from "@playwright/test";
import { registerAndLogin, loginUser, logoutUser } from "../helpers/auth";

test.describe("Auth — Login", () => {
  test("register, logout, then login via browser form", async ({ page }) => {
    const email = `e2e-login-${Date.now()}@test.dev`;
    const password = "Test1234!";

    // Arrange — create a user first (sign-up also logs in), then log out
    await registerAndLogin(page, email, password);
    await logoutUser(page);
    await expect(page).toHaveURL("/auth/sign-in");

    // Act — login with the created user
    await loginUser(page, email, password);

    // Assert — redirected to analysis page
    await expect(page).toHaveURL(/\/app\/analysis/);
    await expect(page.locator("text=Nuevo Análisis de Reclutamiento")).toBeVisible();
  });
});
