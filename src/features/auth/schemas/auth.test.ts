import { describe, expect, it } from "vitest";
import { loginSchema, signupSchema } from "./auth";

describe("auth schemas", () => {
  it("rejects empty login payloads", () => {
    const result = loginSchema.safeParse({ email: "", password: "" });

    expect(result.success).toBe(false);
  });

  it("accepts valid signup payloads", () => {
    const result = signupSchema.safeParse({ email: "ana@empresa.com", password: "secure-password" });

    expect(result.success).toBe(true);
  });
});
