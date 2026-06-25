import { test, expect } from "@playwright/test";
import { registerAndLogin } from "../helpers/auth";

test.describe("Analysis — Validation", () => {
  test("submit empty job description and see validation error", async ({ page }) => {
    const email = `e2e-ana-validate-${Date.now()}@test.dev`;
    const password = "Test1234!";

    // Arrange — login first
    await registerAndLogin(page, email, password);
    await expect(page).toHaveURL(/\/app\/analysis/);

    // Act — click submit without filling the job description
    await page.click('[data-testid="analysis-submit"]');

    // Assert — client-side validation error appears
    await expect(
      page.getByText("Pegá una descripción del puesto antes de ejecutar el análisis."),
    ).toBeVisible();
  });
});
