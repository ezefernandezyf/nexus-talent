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

const { mockHandleOAuthCallback, mockLinkIdentity } = vi.hoisted(() => ({
  mockHandleOAuthCallback: vi.fn(),
  mockLinkIdentity: vi.fn(),
}));

vi.mock("./oauth.service.js", () => ({
  handleOAuthCallback: mockHandleOAuthCallback,
  linkIdentity: mockLinkIdentity,
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

  // ── Link mode tests ────────────────────────────────────────────

  it("link mode calls linkIdentity and redirects to settings with valid userId", async () => {
    mockLinkIdentity.mockResolvedValue(undefined);

    // In a real OAuth flow, the state query param echoes what was
    // sent to Google (including the "link:" prefix), so both the
    // cookie and query param state contain "link:<suffix>".
    const { req, res } = mockReqRes({
      query: { code: "google-auth-code", state: "link:random-suffix" },
      headers: { cookie: "nexus-talent-oauth-state=link:random-suffix" },
      userId: "user-123",
    });

    await googleCallback(req, res, vi.fn());

    expect(mockLinkIdentity).toHaveBeenCalledWith("google-auth-code", "user-123");
    expect(res.redirect).toHaveBeenCalledWith("http://localhost:5173/app/settings?linked=google");
    expect(mockHandleOAuthCallback).not.toHaveBeenCalled();
  });

  it("link mode returns 401 when userId is not set", async () => {
    mockLinkIdentity.mockResolvedValue(undefined);

    const { req, res } = mockReqRes({
      query: { code: "google-auth-code", state: "link:random-suffix" },
      headers: { cookie: "nexus-talent-oauth-state=link:random-suffix" },
      // userId deliberately not set — no valid session
    });

    await googleCallback(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Authentication required" });
    expect(mockLinkIdentity).not.toHaveBeenCalled();
    expect(mockHandleOAuthCallback).not.toHaveBeenCalled();
  });

  it("link mode returns 403 when state does not match (CSRF)", async () => {
    // The outer CSRF check catches mismatches before link mode
    // detection — same behavior as non-link mode.
    const { req, res } = mockReqRes({
      query: { code: "google-auth-code", state: "link:sentinel" },
      headers: { cookie: "nexus-talent-oauth-state=link:wrong-suffix" },
      userId: "user-123",
    });

    await googleCallback(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid OAuth state" });
    expect(mockLinkIdentity).not.toHaveBeenCalled();
    expect(mockHandleOAuthCallback).not.toHaveBeenCalled();
  });

  it("non-link mode still uses handleOAuthCallback (unchanged)", async () => {
    mockHandleOAuthCallback.mockResolvedValue({
      token: "jwt-value-456",
      redirectTo: "http://localhost:5173/app/analysis",
    });

    const { req, res } = mockReqRes({
      query: { code: "google-auth-code", state: "plain-state" },
      headers: { cookie: "nexus-talent-oauth-state=plain-state" },
    });

    await googleCallback(req, res, vi.fn());

    expect(mockHandleOAuthCallback).toHaveBeenCalledWith("google-auth-code");
    expect(mockLinkIdentity).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalled();
    const callArg = (res.redirect as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArg).toMatch(/code=[0-9a-f]{64}/);
  });
});
