import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock prisma before any imports that pull it in
vi.mock("../infra/prisma.js", () => ({
  prisma: {
    profile: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn(),
}));

// Mock the code store — use vi.hoisted so the mock factory can reference it
const { mockGet } = vi.hoisted(() => ({
  mockGet: vi.fn<(code: string) => string | null>(),
}));

vi.mock("./code-store.js", () => ({
  codeStore: {
    get: mockGet,
  },
}));

import { exchangeCode } from "./auth.controller.js";

function mockReqRes(overrides: Record<string, unknown> = {}) {
  const req = {
    headers: {},
    body: {},
    ...overrides,
  } as unknown as import("express").Request;

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as import("express").Response;

  return { req, res };
}

describe("exchangeCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.EXCHANGE_SECRET = "test-secret-123";
  });

  afterEach(() => {
    delete process.env.EXCHANGE_SECRET;
  });

  it("returns 200 with token when valid code and correct secret", async () => {
    const { req, res } = mockReqRes({
      headers: { "x-exchange-secret": "test-secret-123" },
      body: { code: "valid-code" },
    });
    mockGet.mockReturnValue("jwt-token-value");

    await exchangeCode(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: "jwt-token-value" });
    expect(mockGet).toHaveBeenCalledWith("valid-code");
  });

  it("returns 401 and logs when EXCHANGE_SECRET is not configured", async () => {
    delete process.env.EXCHANGE_SECRET;
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const { req, res } = mockReqRes({
      headers: { "x-exchange-secret": "any-secret" },
      body: { code: "some-code" },
    });

    await exchangeCode(req, res);

    expect(consoleError).toHaveBeenCalledWith(
      "EXCHANGE_SECRET is not configured — OAuth code exchange will fail all requests",
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });

    consoleError.mockRestore();
  });

  it("returns 401 when X-Exchange-Secret is missing", async () => {
    const { req, res } = mockReqRes({
      headers: {},
      body: { code: "some-code" },
    });

    await exchangeCode(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("returns 401 when X-Exchange-Secret does not match", async () => {
    const { req, res } = mockReqRes({
      headers: { "x-exchange-secret": "wrong-secret" },
      body: { code: "some-code" },
    });

    await exchangeCode(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
  });

  it("returns 404 when code is unknown or expired", async () => {
    const { req, res } = mockReqRes({
      headers: { "x-exchange-secret": "test-secret-123" },
      body: { code: "unknown-code" },
    });
    mockGet.mockReturnValue(null);

    await exchangeCode(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Code not found or expired" });
  });

  it("returns 404 on second call with same code (single-use enforcement)", async () => {
    const { req: req1, res: res1 } = mockReqRes({
      headers: { "x-exchange-secret": "test-secret-123" },
      body: { code: "single-use" },
    });
    const { req: req2, res: res2 } = mockReqRes({
      headers: { "x-exchange-secret": "test-secret-123" },
      body: { code: "single-use" },
    });

    // First call succeeds (store has it)
    mockGet.mockReturnValueOnce("jwt-once");
    await exchangeCode(req1, res1);
    expect(res1.status).toHaveBeenCalledWith(200);

    // Second call fails (store already deleted it)
    mockGet.mockReturnValueOnce(null);
    await exchangeCode(req2, res2);
    expect(res2.status).toHaveBeenCalledWith(404);
  });
});
