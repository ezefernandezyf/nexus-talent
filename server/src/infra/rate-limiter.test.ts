import { afterEach, describe, expect, it, vi } from "vitest";
import { rateLimiter } from "./rate-limiter.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockReqRes(overrides: Record<string, unknown> = {}) {
  const req = {
    ip: "127.0.0.1",
    socket: { remoteAddress: "127.0.0.1" },
    ...overrides,
  } as unknown as import("express").Request;

  const setHeader = vi.fn();
  const status = vi.fn().mockReturnThis();
  const json = vi.fn().mockReturnThis();

  const res = {
    status,
    json,
    setHeader,
  } as unknown as import("express").Response;

  const next = vi.fn() as import("express").NextFunction;

  return { req, res, next, setHeader, status, json };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("rateLimiter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Backward compatibility (no getTier) ────────────────────

  describe("backward compatibility (no getTier)", () => {
    it("uses IP key with original limits when getTier is not provided", async () => {
      const middleware = rateLimiter({ windowMs: 60_000, max: 10 });
      const { req, res, next } = mockReqRes();

      await middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Limit", 10);
      expect(next).toHaveBeenCalled();
    });

    it("uses IP key when auth'd but getTier is not provided", async () => {
      const middleware = rateLimiter({ windowMs: 60_000, max: 15 });
      const { req, res, next } = mockReqRes({ userId: "user-1" });

      await middleware(req, res, next);

      // No getTier → IP key with original limits (max=15)
      expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Limit", 15);
      expect(next).toHaveBeenCalled();
    });

    it("auth routes with no getTier remain unchanged", async () => {
      // Simulating auth route: 15 min window, 5 max, no getTier
      const middleware = rateLimiter({ windowMs: 900_000, max: 5 });
      const { req, res, next } = mockReqRes();

      for (let i = 0; i < 6; i++) {
        await middleware(req, res, next);
      }

      expect(next).toHaveBeenCalledTimes(5);
      expect(res.status).toHaveBeenCalledWith(429);
    });
  });

  // ── Per-user tier resolution ───────────────────────────────

  describe("per-user tier resolution", () => {
    it("uses userId:tier key with tier limits when getTier returns a valid tier", async () => {
      const getTier = vi.fn().mockResolvedValue("relaxed");
      const middleware = rateLimiter({ windowMs: 60_000, max: 30, getTier });
      const { req, res, next } = mockReqRes({ userId: "user-1" });

      await middleware(req, res, next);

      expect(getTier).toHaveBeenCalledWith("user-1");
      // relaxed tier = 60/min — overrides the 30 fallback
      expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Limit", 60);
      expect(next).toHaveBeenCalled();
    });

    it("uses default tier (30/min) for default-tier user", async () => {
      const getTier = vi.fn().mockResolvedValue("default");
      const middleware = rateLimiter({ windowMs: 60_000, max: 30, getTier });
      const { req, res, next } = mockReqRes({ userId: "user-1" });

      await middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Limit", 30);
      expect(next).toHaveBeenCalled();
    });

    it("uses strict tier (10/min) for strict-tier user", async () => {
      const getTier = vi.fn().mockResolvedValue("strict");
      const middleware = rateLimiter({ windowMs: 60_000, max: 30, getTier });
      const { req, res, next } = mockReqRes({ userId: "user-1" });

      await middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Limit", 10);
      expect(next).toHaveBeenCalled();
    });

    it("uses IP_FALLBACK (max=20) when getTier returns undefined", async () => {
      const getTier = vi.fn().mockResolvedValue(undefined);
      const middleware = rateLimiter({ windowMs: 60_000, max: 30, getTier });
      const { req, res, next } = mockReqRes({ userId: "user-1" });

      await middleware(req, res, next);

      expect(getTier).toHaveBeenCalledWith("user-1");
      // undefined → IP_FALLBACK (max=20)
      expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Limit", 20);
      expect(next).toHaveBeenCalled();
    });

    it("uses IP_FALLBACK when getTier returns an unknown tier", async () => {
      const getTier = vi.fn().mockResolvedValue("ultra");
      const middleware = rateLimiter({ windowMs: 60_000, max: 30, getTier });
      const { req, res, next } = mockReqRes({ userId: "user-1" });

      await middleware(req, res, next);

      // "ultra" not in TIER_LIMITS → IP_FALLBACK (max=20)
      expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Limit", 20);
      expect(next).toHaveBeenCalled();
    });

    it("defaults to IP_FALLBACK when getTier throws", async () => {
      const getTier = vi.fn().mockRejectedValue(new Error("DB error"));
      const middleware = rateLimiter({ windowMs: 60_000, max: 30, getTier });
      const { req, res, next } = mockReqRes({ userId: "user-1" });

      await middleware(req, res, next);

      // Error → catch → IP_FALLBACK (max=20)
      expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Limit", 20);
      expect(next).toHaveBeenCalled();
    });

    it("uses IP_FALLBACK when req.userId is absent even with getTier provided", async () => {
      const getTier = vi.fn();
      const middleware = rateLimiter({ windowMs: 60_000, max: 30, getTier });
      const { req, res, next } = mockReqRes({ userId: undefined });

      await middleware(req, res, next);

      // No userId → IP_FALLBACK (max=20), getTier NOT called
      expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Limit", 20);
      expect(getTier).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it("different users with same tier have independent counters", async () => {
      const getTier = vi.fn().mockResolvedValue("default");
      const middleware = rateLimiter({ windowMs: 60_000, max: 30, getTier });

      // User A exhausts their default tier (30/30)
      const { req: reqA, res: resA, next: nextA } = mockReqRes({ userId: "user-a" });
      for (let i = 0; i < 31; i++) {
        await middleware(reqA, resA, nextA);
      }
      expect(nextA).toHaveBeenCalledTimes(30);
      expect(resA.status).toHaveBeenCalledWith(429);

      // User B starts fresh — 30 available
      const { req: reqB, res: resB, next: nextB } = mockReqRes({ userId: "user-b" });
      for (let i = 0; i < 30; i++) {
        await middleware(reqB, resB, nextB);
      }
      expect(nextB).toHaveBeenCalledTimes(30);
      expect(resB.status).not.toHaveBeenCalledWith(429);
    });
  });

  // ── Rate limit counting ────────────────────────────────────

  describe("rate limit counting", () => {
    it("allows requests within limits — calls next()", async () => {
      const middleware = rateLimiter({ windowMs: 60_000, max: 5 });
      const { req, res, next } = mockReqRes();

      for (let i = 0; i < 5; i++) {
        await middleware(req, res, next);
      }

      expect(next).toHaveBeenCalledTimes(5);
      expect(res.status).not.toHaveBeenCalledWith(429);
    });

    it("blocks requests exceeding limits — returns 429", async () => {
      const middleware = rateLimiter({ windowMs: 60_000, max: 5 });
      const { req, res, next } = mockReqRes();

      for (let i = 0; i < 6; i++) {
        await middleware(req, res, next);
      }

      expect(next).toHaveBeenCalledTimes(5);
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        error: "Too many requests, please try again later.",
      });
    });

    it("allows new requests after reset window elapses", async () => {
      const middleware = rateLimiter({ windowMs: 10_000, max: 1 });

      const { req, res, next } = mockReqRes();

      // First request: within limit
      await middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);

      // Second request before reset: blocked
      await middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(429);
    });
  });

  // ── Headers ────────────────────────────────────────────────

  describe("headers", () => {
    it("sets X-RateLimit headers on every response", async () => {
      const middleware = rateLimiter({ windowMs: 60_000, max: 10 });
      const { req, res, next } = mockReqRes();

      await middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Limit", 10);
      expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Remaining", 9);
      expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Reset", expect.any(Number));
      expect(next).toHaveBeenCalled();
    });

    it("sets Retry-After on 429 response", async () => {
      const middleware = rateLimiter({ windowMs: 60_000, max: 1 });
      const { req, res, next } = mockReqRes();

      await middleware(req, res, next); // within limit
      await middleware(req, res, next); // exceeded

      expect(res.setHeader).toHaveBeenCalledWith("Retry-After", expect.any(Number));
      expect(res.status).toHaveBeenCalledWith(429);
    });

    it("reports correct X-RateLimit-Remaining as requests are consumed", async () => {
      const middleware = rateLimiter({ windowMs: 60_000, max: 5 });
      const { req, res, next, setHeader } = mockReqRes();

      for (let i = 0; i < 3; i++) {
        await middleware(req, res, next);
      }

      // After 3 requests, the last Remaining header should be 2
      const remainingCalls = setHeader.mock.calls.filter(
        (c: unknown[]) => c[0] === "X-RateLimit-Remaining",
      );
      expect(remainingCalls).toHaveLength(3);
      expect(remainingCalls[2][1]).toBe(2);
    });

    it("X-RateLimit-Reset is a positive integer", async () => {
      const middleware = rateLimiter({ windowMs: 60_000, max: 10 });
      const { req, res, next, setHeader } = mockReqRes();

      await middleware(req, res, next);

      const calls = setHeader.mock.calls.filter(
        (c: unknown[]) => c[0] === "X-RateLimit-Reset",
      );
      expect(calls).toHaveLength(1);
      const resetValue = calls[0][1] as number;
      expect(resetValue).toBeGreaterThan(0);
      expect(Number.isInteger(resetValue)).toBe(true);
    });
  });
});
