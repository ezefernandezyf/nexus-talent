import { test, expect } from "@playwright/test";

test("debug signup page navigation", async ({ page }) => {
  // Listen for all navigations
  page.on("console", (msg) => console.log("CONSOLE:", msg.type(), msg.text()));
  page.on("request", (req) => console.log("REQ:", req.method(), req.url()));
  page.on("response", (res) => console.log("RESP:", res.status(), res.url()));

  await page.goto("/auth/sign-up", { timeout: 15_000 });
  await page.waitForTimeout(3000);
  console.log("FINAL URL:", page.url());
  await expect(page.getByRole("heading", { name: "Crear cuenta" })).toBeVisible({ timeout: 5_000 });
});
