import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mock dependencies before imports
// ---------------------------------------------------------------------------
vi.mock("../auth/auth.middleware.js", () => ({
  requireAuth: vi.fn(),
}));

const {
  mockListExperience,
  mockCreateExperience,
  mockUpdateExperience,
  mockDeleteExperience,
  mockListEducation,
  mockCreateEducation,
  mockUpdateEducation,
  mockDeleteEducation,
  mockGenerateCV,
} = vi.hoisted(() => ({
  mockListExperience: vi.fn(),
  mockCreateExperience: vi.fn(),
  mockUpdateExperience: vi.fn(),
  mockDeleteExperience: vi.fn(),
  mockListEducation: vi.fn(),
  mockCreateEducation: vi.fn(),
  mockUpdateEducation: vi.fn(),
  mockDeleteEducation: vi.fn(),
  mockGenerateCV: vi.fn(),
}));

vi.mock("./cv.service.js", () => ({
  listExperience: mockListExperience,
  createExperience: mockCreateExperience,
  updateExperience: mockUpdateExperience,
  deleteExperience: mockDeleteExperience,
  listEducation: mockListEducation,
  createEducation: mockCreateEducation,
  updateEducation: mockUpdateEducation,
  deleteEducation: mockDeleteEducation,
  generateCV: mockGenerateCV,
}));

// ---------------------------------------------------------------------------
// Subject imports
// ---------------------------------------------------------------------------
import type { Request, Response } from "express";
import { cvRouter } from "./cv.router.js";
import { requireAuth } from "../auth/auth.middleware.js";
import { AppError } from "../infra/error-handler.js";
import type { Mock } from "vitest";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setAuth(enabled: boolean) {
  (requireAuth as unknown as Mock).mockImplementation(
    enabled
      ? (_req: Request, _res: Response, next: () => void) => next()
      : (_req: Request, res: Response, _next: () => void) => {
          res.status(401).json({ error: "Authentication required" });
        },
  );
}

function mockReqRes(url: string, options: { body?: Record<string, unknown> } = {}) {
  // Determine HTTP method from URL context (set by caller)
  const req = {
    userId: "user-1",
    body: options.body ?? {},
    params: {},
    headers: {},
    url,
  } as unknown as Request;

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    end: vi.fn(),
  } as unknown as Response;

  return { req, res };
}

/**
 * Convert an Express route pattern (e.g. "/experience/:id") to a regex,
 * extracting named parameter placeholders.
 */
function parseRoutePattern(pattern: string): { regex: RegExp; paramNames: string[] } {
  const paramNames: string[] = [];
  const regexStr = pattern
    .replace(/\//g, "\\/")
    .replace(/:(\w+)/g, (_match, name) => {
      paramNames.push(name);
      return "([^/]+)";
    });
  return { regex: new RegExp(`^${regexStr}$`), paramNames };
}

/**
 * Dispatch a request through the Express router.
 * Matches routes by method AND URL path.
 * Handles errors passed to next(err) by simulating AppError behavior.
 */
async function callHandler(
  router: typeof cvRouter,
  method: string,
  req: Request,
  res: Response,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stack = (router as any).stack as Array<any>;

  for (const layer of stack) {
    if (!layer.route) continue;
    if (!layer.route.methods?.[method]) continue;

    const routePath: string = layer.route.path;
    const { regex, paramNames } = parseRoutePattern(routePath);

    const urlPath = req.url.split("?")[0]; // strip query string
    const match = urlPath.match(regex);
    if (!match) continue;

    // Set route params on req
    paramNames.forEach((name, i) => {
      req.params[name] = match[i + 1];
    });

    // Run handlers in the route stack
    const handlers = layer.route.stack as Array<any>;
    let shouldContinue = true;

    for (const item of handlers) {
      if (!shouldContinue) break;

      let nextCalled = false;

      // eslint-disable-next-line @typescript-eslint/no-loop-func
      const result = item.handle(req, res, (err?: unknown) => {
        nextCalled = true;
        if (err) {
          // Simulate error handler behavior
          if (err instanceof AppError) {
            res.status(err.statusCode).json({ error: err.message });
          } else {
            res.status(500).json({ error: "Internal server error" });
          }
        }
      });
      if (result instanceof Promise) {
        await result;
      }
      shouldContinue = nextCalled;
    }
    return;
  }
  throw new Error(`${method.toUpperCase()} route not found for URL "${req.url}"`);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("cv router — authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 401 on GET /experience without auth", async () => {
    setAuth(false);
    const { req, res } = mockReqRes("/experience");

    await callHandler(cvRouter, "get", req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Authentication required" });
  });

  it("returns 401 on POST /experience without auth", async () => {
    setAuth(false);
    const { req, res } = mockReqRes("/experience", { body: {} });

    await callHandler(cvRouter, "post", req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Authentication required" });
  });

  it("returns 401 on PUT /experience/:id without auth", async () => {
    setAuth(false);
    const { req, res } = mockReqRes("/experience/abc");

    await callHandler(cvRouter, "put", req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Authentication required" });
  });

  it("returns 401 on DELETE /experience/:id without auth", async () => {
    setAuth(false);
    const { req, res } = mockReqRes("/experience/abc");

    await callHandler(cvRouter, "delete", req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Authentication required" });
  });

  it("returns 401 on GET /education without auth", async () => {
    setAuth(false);
    const { req, res } = mockReqRes("/education");

    await callHandler(cvRouter, "get", req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Authentication required" });
  });

  it("returns 401 on POST /education without auth", async () => {
    setAuth(false);
    const { req, res } = mockReqRes("/education", { body: {} });

    await callHandler(cvRouter, "post", req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Authentication required" });
  });

  it("returns 401 on PUT /education/:id without auth", async () => {
    setAuth(false);
    const { req, res } = mockReqRes("/education/abc");

    await callHandler(cvRouter, "put", req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Authentication required" });
  });

  it("returns 401 on DELETE /education/:id without auth", async () => {
    setAuth(false);
    const { req, res } = mockReqRes("/education/abc");

    await callHandler(cvRouter, "delete", req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Authentication required" });
  });
});

describe("cv router — work experience", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAuth(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns empty list when no experience exists", async () => {
    mockListExperience.mockResolvedValue([]);
    const { req, res } = mockReqRes("/experience");

    await callHandler(cvRouter, "get", req, res);

    expect(res.json).toHaveBeenCalledWith([]);
    expect(mockListExperience).toHaveBeenCalledWith("user-1");
  });

  it("creates an experience entry", async () => {
    const input = {
      company: "Nexus",
      role: "CTO",
      startDate: "2024-01-01",
    };
    const created = { id: "exp-1", userId: "user-1", ...input, endDate: null, description: null, location: null };
    mockCreateExperience.mockResolvedValue(created);
    const { req, res } = mockReqRes("/experience", { body: input });

    await callHandler(cvRouter, "post", req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(created);
    expect(mockCreateExperience).toHaveBeenCalledWith("user-1", input);
  });

  it("updates an experience entry", async () => {
    const update = { role: "Senior CTO" };
    const updated = { id: "exp-1", userId: "user-1", company: "Nexus", role: "Senior CTO", startDate: "2024-01-01", endDate: null, description: null, location: null };
    mockUpdateExperience.mockResolvedValue(updated);
    const { req, res } = mockReqRes("/experience/exp-1", { body: update });

    await callHandler(cvRouter, "put", req, res);

    expect(res.json).toHaveBeenCalledWith(updated);
    expect(mockUpdateExperience).toHaveBeenCalledWith("exp-1", "user-1", update);
  });

  it("deletes an experience entry", async () => {
    mockDeleteExperience.mockResolvedValue(undefined);
    const { req, res } = mockReqRes("/experience/exp-1");

    await callHandler(cvRouter, "delete", req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
    expect(mockDeleteExperience).toHaveBeenCalledWith("exp-1", "user-1");
  });

  it("returns 404 when updating non-owned experience", async () => {
    const error = new AppError(404, "Work experience not found");
    mockUpdateExperience.mockRejectedValue(error);
    const { req, res } = mockReqRes("/experience/not-owned", { body: { role: "Hacker" } });

    await callHandler(cvRouter, "put", req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Work experience not found" });
    expect(mockUpdateExperience).toHaveBeenCalledWith("not-owned", "user-1", { role: "Hacker" });
  });

  it("returns 404 when deleting non-owned experience", async () => {
    const error = new AppError(404, "Work experience not found");
    mockDeleteExperience.mockRejectedValue(error);
    const { req, res } = mockReqRes("/experience/not-owned");

    await callHandler(cvRouter, "delete", req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Work experience not found" });
    expect(mockDeleteExperience).toHaveBeenCalledWith("not-owned", "user-1");
  });

  it("returns 400 when creating with missing required fields", async () => {
    const { req, res } = mockReqRes("/experience", { body: { company: "OnlyCo" } });

    await callHandler(cvRouter, "post", req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Validation failed" }),
    );
    expect(mockCreateExperience).not.toHaveBeenCalled();
  });
});

describe("cv router — education", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAuth(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns empty list when no education exists", async () => {
    mockListEducation.mockResolvedValue([]);
    const { req, res } = mockReqRes("/education");

    await callHandler(cvRouter, "get", req, res);

    expect(res.json).toHaveBeenCalledWith([]);
    expect(mockListEducation).toHaveBeenCalledWith("user-1");
  });

  it("creates an education entry", async () => {
    const input = {
      institution: "MIT",
      degree: "BSc CS",
      field: "AI",
      startDate: "2020-09-01",
      endDate: "2024-06-01",
    };
    const created = { id: "edu-1", userId: "user-1", ...input, description: null };
    mockCreateEducation.mockResolvedValue(created);
    const { req, res } = mockReqRes("/education", { body: input });

    await callHandler(cvRouter, "post", req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(created);
    expect(mockCreateEducation).toHaveBeenCalledWith("user-1", input);
  });

  it("updates an education entry", async () => {
    const update = { degree: "MSc CS" };
    const updated = { id: "edu-1", userId: "user-1", institution: "MIT", degree: "MSc CS", field: "AI", startDate: "2020-09-01", endDate: "2024-06-01", description: null };
    mockUpdateEducation.mockResolvedValue(updated);
    const { req, res } = mockReqRes("/education/edu-1", { body: update });

    await callHandler(cvRouter, "put", req, res);

    expect(res.json).toHaveBeenCalledWith(updated);
    expect(mockUpdateEducation).toHaveBeenCalledWith("edu-1", "user-1", update);
  });

  it("deletes an education entry", async () => {
    mockDeleteEducation.mockResolvedValue(undefined);
    const { req, res } = mockReqRes("/education/edu-1");

    await callHandler(cvRouter, "delete", req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
    expect(mockDeleteEducation).toHaveBeenCalledWith("edu-1", "user-1");
  });

  it("returns 404 when updating non-owned education", async () => {
    const error = new AppError(404, "Education not found");
    mockUpdateEducation.mockRejectedValue(error);
    const { req, res } = mockReqRes("/education/not-owned", { body: { degree: "PhD" } });

    await callHandler(cvRouter, "put", req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Education not found" });
    expect(mockUpdateEducation).toHaveBeenCalledWith("not-owned", "user-1", { degree: "PhD" });
  });

  it("returns 404 when deleting non-owned education", async () => {
    const error = new AppError(404, "Education not found");
    mockDeleteEducation.mockRejectedValue(error);
    const { req, res } = mockReqRes("/education/not-owned");

    await callHandler(cvRouter, "delete", req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Education not found" });
    expect(mockDeleteEducation).toHaveBeenCalledWith("not-owned", "user-1");
  });

  it("returns 400 when creating with missing required fields", async () => {
    const { req, res } = mockReqRes("/education", { body: { institution: "MIT" } });

    await callHandler(cvRouter, "post", req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Validation failed" }),
    );
    expect(mockCreateEducation).not.toHaveBeenCalled();
  });
});

describe("cv router — generate CV", () => {
  const mockSuccessResponse = {
    sections: [
      { heading: "Professional Summary", body: "Experienced engineer with 5+ years...", order: 0 },
      { heading: "Skills", body: "- React\n- TypeScript", order: 1 },
    ],
    metadata: {
      generatedAt: "2026-07-12T19:00:00.000Z",
      model: "llama-3.3-70b-versatile",
      sectionCount: 2,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 on POST /generate without auth", async () => {
    setAuth(false);
    const { req, res } = mockReqRes("/generate", { body: {} });

    await callHandler(cvRouter, "post", req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Authentication required" });
  });

  it("returns 400 with invalid tone", async () => {
    setAuth(true);
    const { req, res } = mockReqRes("/generate", { body: { tone: "invalid" } });

    await callHandler(cvRouter, "post", req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Validation failed" }),
    );
    expect(mockGenerateCV).not.toHaveBeenCalled();
  });

  it("returns 400 with jobDescription exceeding 12,000 chars", async () => {
    setAuth(true);
    const { req, res } = mockReqRes("/generate", {
      body: { jobDescription: "x".repeat(12001) },
    });

    await callHandler(cvRouter, "post", req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Validation failed" }),
    );
    expect(mockGenerateCV).not.toHaveBeenCalled();
  });

  it("returns 200 with minimal body (empty object)", async () => {
    setAuth(true);
    mockGenerateCV.mockResolvedValue(mockSuccessResponse);
    const { req, res } = mockReqRes("/generate", { body: {} });

    await callHandler(cvRouter, "post", req, res);

    expect(res.json).toHaveBeenCalledWith(mockSuccessResponse);
    expect(mockGenerateCV).toHaveBeenCalledWith("user-1", {});
  });

  it("returns 200 with full payload (ad-hoc items + jobDescription + tone)", async () => {
    setAuth(true);
    const input = {
      sectionOrder: ["summary", "experience", "skills"],
      adHocItems: [
        { type: "project" as const, title: "Portfolio", description: "Built with Next.js" },
      ],
      jobDescription: "Senior FE role requiring React expertise",
      tone: "casual" as const,
    };
    mockGenerateCV.mockResolvedValue(mockSuccessResponse);
    const { req, res } = mockReqRes("/generate", { body: input });

    await callHandler(cvRouter, "post", req, res);

    expect(res.json).toHaveBeenCalledWith(mockSuccessResponse);
    expect(mockGenerateCV).toHaveBeenCalledWith("user-1", input);
  });

  it("returns 502 when generateCV throws AppError", async () => {
    setAuth(true);
    const error = new AppError(502, "Groq API timed out");
    mockGenerateCV.mockRejectedValue(error);
    const { req, res } = mockReqRes("/generate", { body: {} });

    await callHandler(cvRouter, "post", req, res);

    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json).toHaveBeenCalledWith({ error: "Groq API timed out" });
  });
});
