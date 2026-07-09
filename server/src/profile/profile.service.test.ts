import { beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mock prisma before imports
// ---------------------------------------------------------------------------
const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    profile: {
      findUnique: vi.fn(),
      update: vi.fn(),
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
import { getProfileByUserId, updateProfile } from "./profile.service.js";
import { AppError } from "../infra/error-handler.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-1",
    email: "test@example.com",
    displayName: "Test User",
    skills: null,
    experienceLevel: null,
    roleTitle: null,
    resumeLink: null,
    linkedinUrl: null,
    githubUrl: null,
    location: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("profile.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // getProfileByUserId
  // =========================================================================

  describe("getProfileByUserId", () => {
    it("returns all 10 fields when profile exists", async () => {
      const row = createMockRow({
        skills: "React, TypeScript",
        experienceLevel: "Senior",
        roleTitle: "Full-Stack Developer",
        resumeLink: "https://example.com/resume.pdf",
        linkedinUrl: "https://linkedin.com/in/test",
        githubUrl: "https://github.com/test",
        location: "Buenos Aires",
      });
      mockPrisma.profile.findUnique.mockResolvedValue(row);

      const result = await getProfileByUserId("user-1");

      expect(result).toEqual({
        id: "user-1",
        email: "test@example.com",
        displayName: "Test User",
        skills: "React, TypeScript",
        experienceLevel: "Senior",
        roleTitle: "Full-Stack Developer",
        resumeLink: "https://example.com/resume.pdf",
        linkedinUrl: "https://linkedin.com/in/test",
        githubUrl: "https://github.com/test",
        location: "Buenos Aires",
      });
      expect(mockPrisma.profile.findUnique).toHaveBeenCalledWith({
        where: { id: "user-1" },
      });
    });

    it("returns null fields when profile has no additional data", async () => {
      const row = createMockRow();
      mockPrisma.profile.findUnique.mockResolvedValue(row);

      const result = await getProfileByUserId("user-1");

      expect(result.skills).toBeNull();
      expect(result.experienceLevel).toBeNull();
      expect(result.roleTitle).toBeNull();
      expect(result.resumeLink).toBeNull();
      expect(result.linkedinUrl).toBeNull();
      expect(result.githubUrl).toBeNull();
      expect(result.location).toBeNull();
    });

    it("throws AppError 404 when profile not found", async () => {
      mockPrisma.profile.findUnique.mockResolvedValue(null);

      await expect(getProfileByUserId("nonexistent")).rejects.toThrow(AppError);
      await expect(getProfileByUserId("nonexistent")).rejects.toMatchObject({
        statusCode: 404,
        message: "Profile not found",
      });
    });
  });

  // =========================================================================
  // updateProfile
  // =========================================================================

  describe("updateProfile", () => {
    it("updates partial data (skills only)", async () => {
      const existingRow = createMockRow();
      const updatedRow = createMockRow({ skills: "React, TypeScript" });
      mockPrisma.profile.findUnique.mockResolvedValue(existingRow);
      mockPrisma.profile.update.mockResolvedValue(updatedRow);

      const result = await updateProfile("user-1", { skills: "React, TypeScript" });

      expect(result.skills).toBe("React, TypeScript");
      expect(result.experienceLevel).toBeNull();
      expect(mockPrisma.profile.findUnique).toHaveBeenCalledWith({
        where: { id: "user-1" },
      });
      expect(mockPrisma.profile.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { skills: "React, TypeScript" },
      });
    });

    it("updates all fields when full data provided", async () => {
      const fullData = {
        skills: "React, Node.js",
        experienceLevel: "Senior 5+",
        roleTitle: "Full-Stack Developer",
        resumeLink: "https://example.com/cv.pdf",
        linkedinUrl: "https://linkedin.com/in/user",
        githubUrl: "https://github.com/user",
        location: "Remote",
      };
      const existingRow = createMockRow();
      const updatedRow = createMockRow(fullData);
      mockPrisma.profile.findUnique.mockResolvedValue(existingRow);
      mockPrisma.profile.update.mockResolvedValue(updatedRow);

      const result = await updateProfile("user-1", fullData);

      expect(result.skills).toBe("React, Node.js");
      expect(result.experienceLevel).toBe("Senior 5+");
      expect(result.roleTitle).toBe("Full-Stack Developer");
      expect(result.resumeLink).toBe("https://example.com/cv.pdf");
      expect(result.linkedinUrl).toBe("https://linkedin.com/in/user");
      expect(result.githubUrl).toBe("https://github.com/user");
      expect(result.location).toBe("Remote");
    });

    it("accepts empty data object", async () => {
      const existingRow = createMockRow();
      mockPrisma.profile.findUnique.mockResolvedValue(existingRow);
      mockPrisma.profile.update.mockResolvedValue(existingRow);

      const result = await updateProfile("user-1", {});

      expect(result).toEqual({
        id: "user-1",
        email: "test@example.com",
        displayName: "Test User",
        skills: null,
        experienceLevel: null,
        roleTitle: null,
        resumeLink: null,
        linkedinUrl: null,
        githubUrl: null,
        location: null,
      });
    });

    it("throws AppError 404 when user does not exist", async () => {
      mockPrisma.profile.findUnique.mockResolvedValue(null);

      await expect(updateProfile("nonexistent", { skills: "React" })).rejects.toThrow(AppError);
      await expect(updateProfile("nonexistent", { skills: "React" })).rejects.toMatchObject({
        statusCode: 404,
        message: "Profile not found",
      });
    });

    it("does NOT call update when user not found", async () => {
      mockPrisma.profile.findUnique.mockResolvedValue(null);

      await expect(updateProfile("nonexistent", { skills: "React" })).rejects.toThrow(AppError);
      expect(mockPrisma.profile.update).not.toHaveBeenCalled();
    });
  });
});
