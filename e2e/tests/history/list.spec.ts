import { test, expect } from "@playwright/test";
import { registerAndLogin } from "../helpers/auth";

test.describe("History — List", () => {
  test("view history page after login", async ({ page }) => {
    const email = `e2e-hist-list-${Date.now()}@test.dev`;
    const password = "Test1234!";

    // Arrange — login first
    await registerAndLogin(page, email, password);

    // Act — navigate to history page
    await page.goto("/app/history");

    // Assert — the history page loads with the expected title
    await expect(page.locator("text=Historial de Análisis")).toBeVisible({ timeout: 10_000 });

    // The page should show either an empty state or a list of analyses
    await expect(
      page.getByText(/Las vacantes analizadas aparecerán acá cuando guardes la primera|Exportar datos/),
    ).toBeVisible({ timeout: 15_000 });
  });
});
