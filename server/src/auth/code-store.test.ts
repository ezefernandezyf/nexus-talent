import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CodeStore } from "./code-store.js";

describe("CodeStore", () => {
  let store: CodeStore;

  beforeEach(() => {
    store = new CodeStore();
  });

  afterEach(() => {
    store.stopCleanup();
  });

  describe("set / get (single-use)", () => {
    it("returns a 64-hex-char code when storing a JWT", () => {
      const code = store.set("jwt-value-123");
      expect(code).toMatch(/^[0-9a-f]{64}$/);
    });

    it("returns the stored JWT on first get", () => {
      const code = store.set("jwt-value-456");
      expect(store.get(code)).toBe("jwt-value-456");
    });

    it("returns null on second get (single-use enforcement)", () => {
      const code = store.set("jwt-single-use");
      store.get(code); // first consume
      expect(store.get(code)).toBeNull();
    });

    it("returns null for an unknown code", () => {
      expect(store.get("nonexistent")).toBeNull();
    });
  });

  describe("expiration", () => {
    it("returns null for an expired entry", () => {
      const code = store.set("expired-jwt", -1000); // expired 1s ago
      expect(store.get(code)).toBeNull();
    });

    it("returns JWT for a non-expired entry", () => {
      const code = store.set("valid-jwt", 60_000); // 60s from now
      expect(store.get(code)).toBe("valid-jwt");
    });
  });

  describe("cleanup sweep", () => {
    it("purges expired entries when sweep runs", () => {
      const code1 = store.set("expired-1", -1000);
      const code2 = store.set("valid-1", 60_000);

      store.sweep(); // manual sweep

      expect(store.get(code1)).toBeNull();
      expect(store.get(code2)).toBe("valid-1");
    });

    it("removes multiple expired entries", () => {
      const code1 = store.set("expired-1", -5000);
      const code2 = store.set("expired-2", -3000);
      const code3 = store.set("valid-2", 60_000);

      store.sweep();

      expect(store.get(code1)).toBeNull();
      expect(store.get(code2)).toBeNull();
      expect(store.get(code3)).toBe("valid-2");
    });
  });
});
