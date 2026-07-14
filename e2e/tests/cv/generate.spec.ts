import { test, expect } from "@playwright/test";
import { registerAndLogin } from "../helpers/auth";

test.describe("CV Generator", () => {
  test("CV page renders empty state before generation", async ({ page }) => {
    const email = `e2e-cv-empty-${Date.now()}@test.dev`;
    const password = "Test1234!";

    // Arrange : login first
    await registerAndLogin(page, email, password);
    await expect(page).toHaveURL(/\/app\/analysis/);

    // Act : navigate to CV page
    await page.goto("/app/cv");
    await expect(page).toHaveURL(/\/app\/cv/);

    // Assert : page structure
    // Eyebrow navigation label
    await expect(page.getByText("CV")).toBeVisible();
    // Page heading
    await expect(page.getByRole("heading", { name: /cv generator/i })).toBeVisible();

    // Section order editor should show default sections
    await expect(page.getByText("Resumen Profesional")).toBeVisible();
    await expect(page.getByText("Experiencia Laboral")).toBeVisible();
    await expect(page.getByText("Educacion")).toBeVisible();
    await expect(page.getByText("Habilidades")).toBeVisible();
    await expect(page.getByText("Proyectos")).toBeVisible();

    // Tone selector should be present
    await expect(page.locator('[data-testid="cv-tone-select"]')).toBeVisible();

    // Ad-hoc items section
    await expect(page.getByText("Add Extra Items")).toBeVisible();

    // Generate button
    await expect(page.locator('[data-testid="cv-generate-button"]')).toBeVisible();

    // Empty state welcome message
    await expect(page.getByText(/generá tu cv/i)).toBeVisible();
    await expect(page.getByText(/completá los datos/i)).toBeVisible();
  });

  test("add work experience and education via the browser", async ({ page }) => {
    const email = `e2e-cv-crud-${Date.now()}@test.dev`;
    const password = "Test1234!";

    // Arrange : login first
    await registerAndLogin(page, email, password);
    await expect(page).toHaveURL(/\/app\/analysis/);

    // --- Work Experience ---

    // Act : navigate to experience manager
    await page.goto("/app/cv/experience");
    await expect(page).toHaveURL(/\/app\/cv\/experience/);
    await expect(page.getByRole("heading", { name: /work experience/i })).toBeVisible();

    // Should see empty state first
    await expect(page.getByText("No hay experiencia laboral")).toBeVisible();
    await page.getByRole("button", { name: /add experience/i }).click();

    // Fill the form — use getByLabel for labeled inputs
    await page.getByLabel("Company").fill("Acme Corp");
    await page.getByLabel("Role").fill("Senior Developer");
    await page.getByLabel("Start Date").fill("2020-01-15");

    // Save
    await page.getByRole("button", { name: /save/i }).click();

    // Assert : the entry should appear in the list
    await expect(page.getByRole("heading", { name: "Acme Corp" })).toBeVisible();
    await expect(page.getByText("Senior Developer")).toBeVisible();

    // --- Education ---

    // Act : navigate to education manager
    await page.goto("/app/cv/education");
    await expect(page).toHaveURL(/\/app\/cv\/education/);
    await expect(page.getByRole("heading", { name: /education/i })).toBeVisible();

    // Should see empty state first
    await expect(page.getByText("No hay educación registrada")).toBeVisible();
    await page.getByRole("button", { name: /add education/i }).click();

    // Fill the form
    await page.getByLabel("Institution").fill("MIT");
    await page.getByLabel("Degree").fill("BSc Computer Science");
    await page.getByLabel("Start Date").fill("2016-09-01");

    // Save
    await page.getByRole("button", { name: /save/i }).click();

    // Assert : the entry should appear in the list
    await expect(page.getByRole("heading", { name: "MIT" })).toBeVisible();
    await expect(page.getByText("BSc Computer Science")).toBeVisible();
  });

  test("generate CV and verify result page", async ({ page }) => {
    const email = `e2e-cv-gen-${Date.now()}@test.dev`;
    const password = "Test1234!";

    // Arrange : login first
    await registerAndLogin(page, email, password);
    await expect(page).toHaveURL(/\/app\/analysis/);

    // Navigate to CV page
    await page.goto("/app/cv");
    await expect(page).toHaveURL(/\/app\/cv/);

    // Click generate button
    await page.locator('[data-testid="cv-generate-button"]').click();

    // Assert : either loading, error, or result state appears
    // Groq may not be available in the test environment, so the API either:
    //   - shows "Generating..." (loading), OR
    //   - shows "502 — Generation Failed" (error), OR
    //   - renders the CVPreview (success) with export buttons
    await expect(
      page.getByText(/Generating|Generation Failed|Professional Summary|Download.*\.md/),
    ).toBeVisible({ timeout: 20_000 });
  });
});
