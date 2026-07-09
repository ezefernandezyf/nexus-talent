import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mock dependencies before imports
// ---------------------------------------------------------------------------
const { mockGetProfileByUserId } = vi.hoisted(() => ({
  mockGetProfileByUserId: vi.fn(),
}));

vi.mock("../profile/profile.service.js", () => ({
  getProfileByUserId: mockGetProfileByUserId,
}));

const { mockAnalyze } = vi.hoisted(() => ({
  mockAnalyze: vi.fn(),
}));

vi.mock("./analysis.service.js", () => ({
  analyze: mockAnalyze,
}));

// Must always return a Promise so .catch() in the controller works
// Factory creates a fresh mock that returns a promise by default
vi.mock("../history/history.service.js", () => ({
  saveAnalysis: vi.fn(() => Promise.resolve()),
}));

// ---------------------------------------------------------------------------
// Subject imports
// ---------------------------------------------------------------------------
import { analyze } from "./analysis.controller.js";
import { logger } from "../infra/logger.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockReqRes(overrides: Record<string, unknown> = {}) {
  const req = {
    userId: "user-1",
    body: { jobDescription: "Senior React Developer" },
    log: { info: vi.fn() },
    ...overrides,
  } as unknown as import("express").Request;

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as import("express").Response;

  const next = vi.fn() as import("express").NextFunction;

  return { req, res, next };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("analysis controller — analyze", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls getProfileByUserId before analyze and injects profileContext", async () => {
    const { req, res, next } = mockReqRes();

    mockGetProfileByUserId.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      displayName: null,
      skills: "React, TypeScript",
      experienceLevel: "Senior",
      roleTitle: "Full-Stack Developer",
      resumeLink: null,
      linkedinUrl: null,
      githubUrl: null,
      location: "Buenos Aires",
    });

    mockAnalyze.mockResolvedValue({
      id: "analysis-1",
      summary: "Analysis result",
      createdAt: new Date().toISOString(),
    });

    await analyze(req, res, next);

    expect(mockGetProfileByUserId).toHaveBeenCalledWith("user-1");
    expect(mockAnalyze).toHaveBeenCalledWith(
      { jobDescription: "Senior React Developer" },
      "Rol: Full-Stack Developer. Experiencia: Senior. Skills: React, TypeScript. Ubicación: Buenos Aires.",
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ summary: "Analysis result" }),
    );
  });

  it("passes null profileContext when profile fetch fails", async () => {
    const { req, res, next } = mockReqRes();
    const warnSpy = vi.spyOn(logger, "warn").mockImplementation(() => {});

    mockGetProfileByUserId.mockRejectedValue(new Error("DB connection error"));
    mockAnalyze.mockResolvedValue({
      id: "analysis-1",
      summary: "Fallback result",
      createdAt: new Date().toISOString(),
    });

    await analyze(req, res, next);

    expect(mockGetProfileByUserId).toHaveBeenCalledWith("user-1");
    expect(mockAnalyze).toHaveBeenCalledWith(
      { jobDescription: "Senior React Developer" },
      null,
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1" }),
      "Profile fetch failed, proceeding without context",
    );
    expect(res.status).toHaveBeenCalledWith(200);

    warnSpy.mockRestore();
  });

  it("passes empty string profileContext when user has no profile data (all null)", async () => {
    const { req, res, next } = mockReqRes();

    mockGetProfileByUserId.mockResolvedValue({
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

    mockAnalyze.mockResolvedValue({
      id: "analysis-1",
      summary: "Result",
      createdAt: new Date().toISOString(),
    });

    await analyze(req, res, next);

    // buildProfileContext returns "" for all-null profile
    expect(mockAnalyze).toHaveBeenCalledWith(
      { jobDescription: "Senior React Developer" },
      "",
    );
  });

  it("skips profile fetch when userId is undefined", async () => {
    const { req, res, next } = mockReqRes({ userId: undefined });

    mockAnalyze.mockResolvedValue({
      id: "analysis-1",
      summary: "Anonymous result",
      createdAt: new Date().toISOString(),
    });

    await analyze(req, res, next);

    expect(mockGetProfileByUserId).not.toHaveBeenCalled();
    // profileContext is null (initial value) when userId is undefined
    expect(mockAnalyze).toHaveBeenCalledWith(
      { jobDescription: "Senior React Developer" },
      null,
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
