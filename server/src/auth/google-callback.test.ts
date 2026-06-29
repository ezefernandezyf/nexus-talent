import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

const { mockHandleOAuthCallback } = vi.hoisted(() => ({
  mockHandleOAuthCallback: vi.fn(),
}));

vi.mock("./oauth.service.js", () => ({
  handleOAuthCallback: mockHandleOAuthCallback,
  generateState: vi.fn(),
  getGoogleAuthURL: vi.fn(),
}));

import { googleCallback } from "./auth.controller.js";

function mockReqRes(overrides: Record<string, unknown> = {}) {
  const req = {
    query: {},
    headers: { cookie: "" },
    ...overrides,
  } as unknown as import("express").Request;

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    cookie: vi.fn().mockReturnThis(),
    redirect: vi.fn(),
  } as unknown as import("express").Response;

  return { req, res };
}

describe("googleCallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLIENT_URL = "http://localhost:5173";
    process.env.JWT_SECRET = "test-secret";
  });

  afterEach(() => {
    delete process.env.CLIENT_URL;
    delete process.env.JWT_SECRET;
  });

  it("redirects with ?code= instead of ?token= in the URL", async () => {
    mockHandleOAuthCallback.mockResolvedValue({
      token: "jwt-value-123",
      redirectTo: "http://localhost:5173/app/analysis",
    });

    const { req, res } = mockReqRes({
      query: { code: "google-auth-code", state: "valid-state" },
      headers: { cookie: "nexus-talent-oauth-state=valid-state" },
    });

    await googleCallback(req, res, vi.fn());

    expect(res.redirect).toHaveBeenCalled();
    const callArg = (res.redirect as ReturnType<typeof vi.fn>).mock.calls[0][0];
    // Must NOT contain the JWT directly
    expect(callArg).not.toContain("?token=jwt-value-123");
    expect(callArg).not.toContain("token=");
    // Must contain a one-time code
    expect(callArg).toMatch(/code=[0-9a-f]{64}/);
    expect(callArg).toContain("redirect=/app/analysis");
  });

  it("returns 403 when OAuth state is missing or mismatched", async () => {
    const { req, res } = mockReqRes({
      query: { code: "auth-code", state: "wrong-state" },
      headers: { cookie: "nexus-talent-oauth-state=valid-state" },
    });

    await googleCallback(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid OAuth state" });
  });

  it("returns 400 when authorization code is missing", async () => {
    const { req, res } = mockReqRes({
      query: { state: "valid-state" },
      headers: { cookie: "nexus-talent-oauth-state=valid-state" },
    });

    await googleCallback(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Missing authorization code" });
  });
});
