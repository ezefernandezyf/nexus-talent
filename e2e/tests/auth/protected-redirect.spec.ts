import { test, expect } from "@playwright/test";

test.describe("Auth: Protected Route Redirect", () => {
  test("unauthenticated user is redirected to login when accessing a protected page", async ({ page }) => {
    // ACT : try to access a protected page without logging in
    await page.goto("/app/analysis");

    // ASSERT : the app should redirect unauthenticated users to the login page.
    // We verify TWO things (gratis, sin costo extra):
    //   1. The URL ends up at /auth/sign-in (redirect worked)
    //   2. The login form is visible (page actually rendered, not just a URL trick)
    await expect(page).toHaveURL("/auth/sign-in");
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
  });
});
