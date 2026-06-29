import { test, expect } from "@playwright/test";

test.describe("Code Exchange: Error Paths", () => {
  test("returns 401 when X-Exchange-Secret is missing", async ({ request }) => {
    const response = await request.post("/api/auth/exchange", {
      data: { code: "any-code" },
      // No X-Exchange-Secret header
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Unauthorized");
  });

  test("returns 401 when X-Exchange-Secret is wrong", async ({ request }) => {
    const response = await request.post("/api/auth/exchange", {
      data: { code: "any-code" },
      headers: {
        "X-Exchange-Secret": "wrong-secret-value",
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Unauthorized");
  });

  test("returns 404 when code is not found or expired", async ({ request }) => {
    const response = await request.post("/api/auth/exchange", {
      data: { code: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
      headers: {
        "X-Exchange-Secret": "e2e-test-exchange-secret",
      },
    });

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("Code not found or expired");
  });
});
