import { test, expect } from "@playwright/test";
import { registerAndLogin } from "../helpers/auth";

test.describe("History: Delete", () => {
  test("navigate to history and verify empty state for new user", async ({ page }) => {
    const email = `e2e-hist-del-${Date.now()}@test.dev`;
    const password = "Test1234!";

    // Arrange : login first
    await registerAndLogin(page, email, password);

    // Act : navigate to history page
    await page.goto("/app/history");

    // Assert : the history page shows the expected title
    await expect(page.locator("text=Historial de Análisis")).toBeVisible({ timeout: 10_000 });

    // For a new user, the history should be empty
    await expect(
      page.getByText(/Las vacantes analizadas aparecerán acá cuando guardes la primera/),
    ).toBeVisible({ timeout: 10_000 });
  });
});
