import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mock dependencies before imports
// ---------------------------------------------------------------------------
vi.mock("../auth/auth.middleware.js", () => ({
  requireAuth: vi.fn((_req, _res, next) => next()),
}));

const { mockUpdateProfile, mockGetProfileByUserId } = vi.hoisted(() => ({
  mockUpdateProfile: vi.fn(),
  mockGetProfileByUserId: vi.fn(),
}));

vi.mock("./profile.service.js", () => ({
  updateProfile: mockUpdateProfile,
  getProfileByUserId: mockGetProfileByUserId,
}));

// ---------------------------------------------------------------------------
// Subject imports
// ---------------------------------------------------------------------------
import { profileRouter } from "./profile.router.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = {
    userId: "user-1",
    body,
    headers: {},
    method: "PUT",
    url: "/",
  } as unknown as import("express").Request;

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    end: vi.fn(),
  } as unknown as import("express").Response;

  return { req, res };
}

/**
 * Dispatch a request through the Express router directly.
 * Express 5 stores route handlers in layer.route.stack.
 */
async function callPutHandler(req: import("express").Request, res: import("express").Response) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stack = (profileRouter as any).stack as Array<any>;
  for (const layer of stack) {
    if (!layer.route) continue;
    if (!layer.route.methods?.put) continue;

    for (const item of layer.route.stack as Array<any>) {
      const result = item.handle(req, res, () => {});
      if (result instanceof Promise) {
        await result;
      }
    }
    return;
  }
  throw new Error("PUT route not found in router stack");
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("profile router — PUT /", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 200 and profile on valid input", async () => {
    const { req, res } = mockReqRes({
      skills: "React, TypeScript",
      roleTitle: "Developer",
    });

    mockUpdateProfile.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      displayName: null,
      skills: "React, TypeScript",
      experienceLevel: null,
      roleTitle: "Developer",
      resumeLink: null,
      linkedinUrl: null,
      githubUrl: null,
      location: null,
    });

    await callPutHandler(req, res);

    // handler calls res.json() directly (Express defaults to 200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        skills: "React, TypeScript",
        roleTitle: "Developer",
      }),
    );
    expect(mockUpdateProfile).toHaveBeenCalledWith("user-1", {
      skills: "React, TypeScript",
      roleTitle: "Developer",
    });
  });

  it("returns 400 with Zod issues when linkedinUrl is invalid", async () => {
    const { req, res } = mockReqRes({ linkedinUrl: "not-a-url" });

    await callPutHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.arrayContaining([
          expect.objectContaining({
            code: "invalid_format",
            format: "url",
          }),
        ]),
      }),
    );
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  it("accepts empty skills string (transforms to undefined)", async () => {
    // Empty string is transformed to undefined by Zod (or().literal("").transform(() => undefined))
    // so the field is simply not updated
    const { req, res } = mockReqRes({ skills: "" });

    mockUpdateProfile.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      displayName: null,
      skills: null,
      experienceLevel: null,
      roleTitle: null,
      resumeLink: null,
      linkedinUrl: null,
      githubUrl: null,
      location: null,
    });

    await callPutHandler(req, res);

    expect(res.json).toHaveBeenCalled();
    expect(mockUpdateProfile).toHaveBeenCalledWith("user-1", {});
  });

  it("returns 400 when githubUrl is invalid", async () => {
    const { req, res } = mockReqRes({ githubUrl: "not-a-url" });

    await callPutHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  it("accepts empty body (all fields optional)", async () => {
    const { req, res } = mockReqRes({});

    mockUpdateProfile.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      displayName: null,
      skills: null,
      experienceLevel: null,
      roleTitle: null,
      resumeLink: null,
      linkedinUrl: null,
      githubUrl: null,
      location: null,
    });

    await callPutHandler(req, res);

    expect(res.json).toHaveBeenCalled();
    expect(mockUpdateProfile).toHaveBeenCalledWith("user-1", {});
  });
});
