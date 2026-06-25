import { test, expect } from "@playwright/test";
import { registerAndLogin } from "../helpers/auth";

test.describe("Auth — Sign Up", () => {
  test("register a new user via browser and verify redirect to analysis page", async ({ page }) => {
    const email = `e2e-signup-${Date.now()}@test.dev`;
    const password = "Test1234!";

    // Act — register via browser form submission
    await registerAndLogin(page, email, password);

    // Assert — redirected to the analysis page after successful sign up
    await expect(page).toHaveURL(/\/app\/analysis/);
    await expect(page.locator("text=Nuevo Análisis de Reclutamiento")).toBeVisible();
  });
});
