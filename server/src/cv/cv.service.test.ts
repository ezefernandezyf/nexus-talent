import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mock prisma before imports
// ---------------------------------------------------------------------------
const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    workExperience: {
      findMany: vi.fn(),
    },
    education: {
      findMany: vi.fn(),
    },
    project: {
      findMany: vi.fn(),
    },
    profile: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn(),
}));

vi.mock("../infra/prisma.js", () => ({
  prisma: mockPrisma,
}));

// ---------------------------------------------------------------------------
// Subject imports (after mocks)
// ---------------------------------------------------------------------------
import { generateCV } from "./cv.service.js";
import { AppError } from "../infra/error-handler.js";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockExperience = {
  id: "exp-1",
  userId: "user-1",
  company: "Nexus Talent",
  role: "Senior Engineer",
  startDate: "2023-01-01",
  endDate: null,
  description: "Built the platform",
  location: "Remote",
};

const mockEducation = {
  id: "edu-1",
  userId: "user-1",
  institution: "MIT",
  degree: "BSc Computer Science",
  field: "Computer Science",
  startDate: "2018-09-01",
  endDate: "2022-06-01",
  description: "Graduated with honors",
};

const mockProfile = {
  id: "user-1",
  email: "test@example.com",
  displayName: "Test User",
  skills: "React, TypeScript, Node.js",
  experienceLevel: "Senior",
  roleTitle: "Full-Stack Developer",
  resumeLink: null,
  linkedinUrl: null,
  githubUrl: null,
  location: "Remote",
};

const mockValidResponse = {
  sections: [
    { heading: "Professional Summary", body: "Experienced engineer with 5+ years building web platforms.", order: 0 },
    { heading: "Skills", body: "- React\n- TypeScript\n- Node.js", order: 1 },
  ],
  metadata: {
    generatedAt: "2026-07-12T20:00:00.000Z",
    model: "llama-3.3-70b-versatile",
    sectionCount: 2,
  },
};

function buildGroqEnvelope(content: string) {
  return {
    choices: [{ message: { content } }],
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("cv.service — generateCV", () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("GROQ_API_KEY", "test-groq-key");
    vi.stubEnv("GROQ_MODEL", "llama-3.3-70b-versatile");
    mockFetch = vi.spyOn(globalThis, "fetch") as unknown as ReturnType<typeof vi.fn>;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  // -----------------------------------------------------------------------
  // 1. generateCV success
  // -----------------------------------------------------------------------
  it("returns valid CV when all data is present", async () => {
    mockPrisma.workExperience.findMany.mockResolvedValue([mockExperience]);
    mockPrisma.education.findMany.mockResolvedValue([mockEducation]);
    mockPrisma.project.findMany.mockResolvedValue([]);
    mockPrisma.profile.findUnique.mockResolvedValue(mockProfile);
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(buildGroqEnvelope(JSON.stringify(mockValidResponse))),
    });

    const result = await generateCV("user-1", {});

    expect(result).toBeDefined();
    expect(result.sections).toHaveLength(2);
    expect(result.sections[0]).toMatchObject({
      heading: "Professional Summary",
      body: expect.any(String),
      order: 0,
    });
    expect(result.sections[1]).toMatchObject({
      heading: "Skills",
      body: expect.any(String),
      order: 1,
    });
    expect(result.metadata).toMatchObject({
      generatedAt: expect.any(String),
      model: "llama-3.3-70b-versatile",
      sectionCount: 2,
    });

    // Verify DB queries were called
    expect(mockPrisma.workExperience.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      orderBy: { startDate: "desc" },
    });
    expect(mockPrisma.education.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      orderBy: { startDate: "desc" },
    });
    expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      orderBy: { startDate: "desc" },
    });
    expect(mockPrisma.profile.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
    });

    // Verify fetch was called with the Groq endpoint
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.groq.com/openai/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-groq-key",
        }),
      }),
    );
  });

  // -----------------------------------------------------------------------
  // 2. generateCV with empty experience (REQ-CV-007)
  // -----------------------------------------------------------------------
  it("proceeds when experience list is empty", async () => {
    mockPrisma.workExperience.findMany.mockResolvedValue([]);
    mockPrisma.education.findMany.mockResolvedValue([mockEducation]);
    mockPrisma.project.findMany.mockResolvedValue([]);
    mockPrisma.profile.findUnique.mockResolvedValue(mockProfile);
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(buildGroqEnvelope(JSON.stringify(mockValidResponse))),
    });

    const result = await generateCV("user-1", {});

    expect(result.metadata.sectionCount).toBe(2);
    // Verify experience query returned empty
    expect(mockPrisma.workExperience.findMany).toHaveBeenCalled();
    const findManyResult = await mockPrisma.workExperience.findMany.mock.results[0].value;
    expect(findManyResult).toEqual([]);
  });

  // -----------------------------------------------------------------------
  // 3. generateCV Groq timeout (AbortError)
  // -----------------------------------------------------------------------
  it("throws 502 when Groq request times out", async () => {
    mockPrisma.workExperience.findMany.mockResolvedValue([mockExperience]);
    mockPrisma.education.findMany.mockResolvedValue([mockEducation]);
    mockPrisma.project.findMany.mockResolvedValue([]);
    mockPrisma.profile.findUnique.mockResolvedValue(mockProfile);

    const abortError = new Error("The operation was aborted");
    abortError.name = "AbortError";
    mockFetch.mockRejectedValue(abortError);

    await expect(generateCV("user-1", {})).rejects.toThrow(AppError);
    await expect(generateCV("user-1", {})).rejects.toMatchObject({
      statusCode: 502,
      message: expect.stringContaining("timed out"),
    });
  });

  // -----------------------------------------------------------------------
  // 4. generateCV invalid Groq response (invalid JSON in content)
  // -----------------------------------------------------------------------
  it("throws 502 when Groq returns invalid JSON content", async () => {
    mockPrisma.workExperience.findMany.mockResolvedValue([mockExperience]);
    mockPrisma.education.findMany.mockResolvedValue([mockEducation]);
    mockPrisma.project.findMany.mockResolvedValue([]);
    mockPrisma.profile.findUnique.mockResolvedValue(mockProfile);
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(buildGroqEnvelope("this is not valid json")),
    });

    await expect(generateCV("user-1", {})).rejects.toThrow(AppError);
    await expect(generateCV("user-1", {})).rejects.toMatchObject({
      statusCode: 502,
    });
  });

  // -----------------------------------------------------------------------
  // 5. generateCV Zod validation failure
  // -----------------------------------------------------------------------
  it("throws 502 when Groq response fails Zod validation", async () => {
    mockPrisma.workExperience.findMany.mockResolvedValue([mockExperience]);
    mockPrisma.education.findMany.mockResolvedValue([mockEducation]);
    mockPrisma.project.findMany.mockResolvedValue([]);
    mockPrisma.profile.findUnique.mockResolvedValue(mockProfile);
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(buildGroqEnvelope(JSON.stringify({ wrong: "shape" }))),
    });

    await expect(generateCV("user-1", {})).rejects.toThrow(AppError);
    await expect(generateCV("user-1", {})).rejects.toMatchObject({
      statusCode: 502,
      message: "AI response validation failed",
    });
  });

  // -----------------------------------------------------------------------
  // 6. generateCV missing API key
  // -----------------------------------------------------------------------
  it("throws 502 when GROQ_API_KEY is not configured", async () => {
    vi.stubEnv("GROQ_API_KEY", "");
    mockPrisma.workExperience.findMany.mockResolvedValue([mockExperience]);
    mockPrisma.education.findMany.mockResolvedValue([mockEducation]);
    mockPrisma.project.findMany.mockResolvedValue([]);
    mockPrisma.profile.findUnique.mockResolvedValue(mockProfile);

    await expect(generateCV("user-1", {})).rejects.toThrow(AppError);
    await expect(generateCV("user-1", {})).rejects.toMatchObject({
      statusCode: 502,
      message: expect.stringContaining("GROQ_API_KEY"),
    });

    // Verify fetch was never called (short-circuits before network)
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
