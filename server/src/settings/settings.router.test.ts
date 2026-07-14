import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mock dependencies before imports
// ---------------------------------------------------------------------------
vi.mock("../auth/auth.middleware.js", () => ({
  requireAuth: vi.fn(),
}));

const { mockGetOrCreate, mockUpsert } = vi.hoisted(() => ({
  mockGetOrCreate: vi.fn(),
  mockUpsert: vi.fn(),
}));

vi.mock("./settings.service.js", () => ({
  getOrCreate: mockGetOrCreate,
  upsert: mockUpsert,
}));

// ---------------------------------------------------------------------------
// Subject imports
// ---------------------------------------------------------------------------
import type { Request, Response } from "express";
import { settingsRouter } from "./settings.router.js";
import { requireAuth } from "../auth/auth.middleware.js";
import type { Mock } from "vitest";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_SETTINGS = {
  theme: "light",
  emailDigest: true,
  rateLimitTier: "default",
} as const;

function setAuth(enabled: boolean) {
  (requireAuth as unknown as Mock).mockImplementation(
    enabled
      ? (_req: Request, _res: Response, next: () => void) => next()
      : (_req: Request, res: Response, _next: () => void) => {
          res.status(401).json({ error: "Authentication required" });
        },
  );
}

function mockReqRes(method: "GET" | "PUT", body: Record<string, unknown> = {}) {
  const req = {
    userId: "user-1",
    body,
    headers: {},
    method,
    url: "/",
  } as unknown as Request;

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    end: vi.fn(),
  } as unknown as Response;

  return { req, res };
}

/**
 * Dispatch a request through the Express router directly.
 * Express 5 stores route handlers in layer.route.stack.
 * Respects middleware chain: if a handler doesn't call next(), the chain stops.
 */
async function callHandler(
  router: typeof settingsRouter,
  method: "get" | "put",
  req: Request,
  res: Response,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stack = (router as any).stack as Array<any>;
  for (const layer of stack) {
    if (!layer.route) continue;
    if (!layer.route.methods?.[method]) continue;

    const handlers = layer.route.stack as Array<any>;
    let shouldContinue = true;

    for (const item of handlers) {
      if (!shouldContinue) break;

      let nextCalled = false;
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      const result = item.handle(req, res, () => { nextCalled = true; });
      if (result instanceof Promise) {
        await result;
      }
      shouldContinue = nextCalled;
    }
    return;
  }
  throw new Error(`${method.toUpperCase()} route not found in router stack`);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("settings router — GET /", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 401 without auth", async () => {
    setAuth(false);
    const { req, res } = mockReqRes("GET");

    await callHandler(settingsRouter, "get", req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Authentication required" });
    expect(mockGetOrCreate).not.toHaveBeenCalled();
  });

  it("returns 200 and auto-creates defaults on first access", async () => {
    setAuth(true);
    const { req, res } = mockReqRes("GET");

    mockGetOrCreate.mockResolvedValue({ ...DEFAULT_SETTINGS });

    await callHandler(settingsRouter, "get", req, res);

    expect(res.json).toHaveBeenCalledWith(DEFAULT_SETTINGS);
    expect(mockGetOrCreate).toHaveBeenCalledWith("user-1");
  });
});

describe("settings router — PUT /", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 401 without auth", async () => {
    setAuth(false);
    const { req, res } = mockReqRes("PUT");

    await callHandler(settingsRouter, "put", req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Authentication required" });
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("partial update preserves unchanged fields", async () => {
    setAuth(true);
    const { req, res } = mockReqRes("PUT", { theme: "dark" });

    mockUpsert.mockResolvedValue({
      theme: "dark",
      emailDigest: true,
      rateLimitTier: "default",
    });

    await callHandler(settingsRouter, "put", req, res);

    expect(res.json).toHaveBeenCalledWith({
      theme: "dark",
      emailDigest: true,
      rateLimitTier: "default",
    });
    expect(mockUpsert).toHaveBeenCalledWith("user-1", { theme: "dark" });
  });

  it("returns 400 on invalid enum value", async () => {
    setAuth(true);
    const { req, res } = mockReqRes("PUT", { theme: "neon" });

    await callHandler(settingsRouter, "put", req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Validation failed",
        details: expect.arrayContaining([
          expect.objectContaining({ code: "invalid_value", path: ["theme"] }),
        ]),
      }),
    );
    expect(mockUpsert).not.toHaveBeenCalled();
  });
});
