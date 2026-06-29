import { test, expect } from "@playwright/test";
import { registerAndLogin } from "../helpers/auth";

test.describe("Analysis: Submit", () => {
  test("submit a job description via browser form and verify a response appears", async ({ page }) => {
    const email = `e2e-ana-submit-${Date.now()}@test.dev`;
    const password = "Test1234!";

    // Arrange : login first
    await registerAndLogin(page, email, password);
    await expect(page).toHaveURL(/\/app\/analysis/);

    // Act : fill job description and submit
    await page.fill(
      '[data-testid="job-description-input"]',
      "Senior Software Engineer with TypeScript experience.",
    );
    await page.click('[data-testid="analysis-submit"]');

    // Assert : either a loading state, error state, or result appears
    // The analysis may fail without GROQ_API_KEY, but the page should show content
    await expect(
      page.getByText(/El análisis está en marcha|No se pudo completar|Análisis estructurado de la vacante/),
    ).toBeVisible({ timeout: 15_000 });
  });
});
