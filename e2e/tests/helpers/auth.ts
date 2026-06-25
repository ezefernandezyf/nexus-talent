import type { Page } from "@playwright/test";

/**
 * Navigate to /auth/sign-up, register a new user, and wait for redirect
 * to the analysis page. Uses Playwright's auto-waiting (fill/click wait
 * for the target to be visible, enabled, and stable).
 */
export async function registerAndLogin(page: Page, email: string, password: string) {
  // networkidle waits for the session check (GET /api/auth/me)
  // to resolve before interacting with the form
  await page.goto("/auth/sign-up", { waitUntil: "networkidle" });

  // Playwright auto-waits for these to be visible and enabled
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.fill('[data-testid="confirm-password-input"]', password);
  await page.click('[data-testid="sign-up-submit"]');

  // After successful registration, the backend sets an httpOnly cookie
  // and the client redirects to /app/analysis
  await page.waitForURL(/\/app\/analysis/, { timeout: 15_000 });
}

/**
 * Navigate to /auth/sign-in, fill credentials, and wait for redirect.
 */
export async function loginUser(page: Page, email: string, password: string) {
  await page.goto("/auth/sign-in", { waitUntil: "networkidle" });
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="sign-in-submit"]');
  await page.waitForURL(/\/app\/analysis/, { timeout: 15_000 });
}

/**
 * Open the account menu and click the logout button.
 */
export async function logoutUser(page: Page) {
  await page.waitForSelector('button[aria-label="Abrir acciones de cuenta"]', { state: "visible" });
  await page.click('button[aria-label="Abrir acciones de cuenta"]');
  await page.click('[data-testid="logout-button"]');
  await page.waitForURL("/auth/sign-in", { timeout: 15_000 });
}
