import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/core/api-client";

vi.mock("@/core/api-client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPut = vi.mocked(apiClient.put);
const mockDelete = vi.mocked(apiClient.delete);

beforeEach(() => {
  vi.clearAllMocks();
});

// Lazy import so mocks are applied
async function loadRepo() {
  return import("./cv-repository");
}

describe("cv-repository", () => {
  // =========================================================================
  // listExperience
  // =========================================================================
  describe("listExperience", () => {
    it("calls GET /cv/experience and returns work experience entries", async () => {
      const entries = [
        { id: "1", userId: "u1", company: "Acme", role: "Senior Dev", startDate: "2023-01-01" },
        { id: "2", userId: "u1", company: "StartupCo", role: "Junior Dev", startDate: "2021-06-01" },
      ];
      mockGet.mockResolvedValue({ data: entries });

      const { listExperience } = await loadRepo();
      const result = await listExperience();

      expect(result).toEqual(entries);
      expect(result).toHaveLength(2);
      expect(result[0].company).toBe("Acme");
      expect(mockGet).toHaveBeenCalledWith("/cv/experience");
    });

    it("returns empty array when no entries exist", async () => {
      mockGet.mockResolvedValue({ data: [] });

      const { listExperience } = await loadRepo();
      const result = await listExperience();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  // =========================================================================
  // createExperience
  // =========================================================================
  describe("createExperience", () => {
    it("calls POST /cv/experience with body and returns created entry", async () => {
      const input = { company: "Nexus", role: "CTO", startDate: "2024-01-01" };
      const created = { id: "abc-123", userId: "u1", ...input };
      mockPost.mockResolvedValue({ data: created });

      const { createExperience } = await loadRepo();
      const result = await createExperience(input);

      expect(result).toEqual(created);
      expect(result.id).toBe("abc-123");
      expect(mockPost).toHaveBeenCalledWith("/cv/experience", input);
    });

    it("passes optional fields when provided", async () => {
      const input = {
        company: "Nexus",
        role: "Dev",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        description: "Built stuff",
        location: "Remote",
      };
      const created = { id: "def-456", userId: "u1", ...input };
      mockPost.mockResolvedValue({ data: created });

      const { createExperience } = await loadRepo();
      const result = await createExperience(input);

      expect(result.description).toBe("Built stuff");
      expect(result.location).toBe("Remote");
      expect(mockPost).toHaveBeenCalledWith("/cv/experience", input);
    });
  });

  // =========================================================================
  // updateExperience
  // =========================================================================
  describe("updateExperience", () => {
    it("calls PUT /cv/experience/:id with body and returns updated entry", async () => {
      const input = { role: "Senior CTO" };
      const updated = { id: "abc-123", userId: "u1", company: "Nexus", role: "Senior CTO", startDate: "2024-01-01" };
      mockPut.mockResolvedValue({ data: updated });

      const { updateExperience } = await loadRepo();
      const result = await updateExperience("abc-123", input);

      expect(result).toEqual(updated);
      expect(result.role).toBe("Senior CTO");
      expect(mockPut).toHaveBeenCalledWith("/cv/experience/abc-123", input);
    });
  });

  // =========================================================================
  // deleteExperience
  // =========================================================================
  describe("deleteExperience", () => {
    it("calls DELETE /cv/experience/:id", async () => {
      mockDelete.mockResolvedValue({ data: undefined });

      const { deleteExperience } = await loadRepo();
      await deleteExperience("abc-123");

      expect(mockDelete).toHaveBeenCalledWith("/cv/experience/abc-123");
    });
  });

  // =========================================================================
  // listEducation
  // =========================================================================
  describe("listEducation", () => {
    it("calls GET /cv/education and returns education entries", async () => {
      const entries = [
        { id: "1", userId: "u1", institution: "MIT", degree: "BSc CS", startDate: "2020-09-01" },
      ];
      mockGet.mockResolvedValue({ data: entries });

      const { listEducation } = await loadRepo();
      const result = await listEducation();

      expect(result).toEqual(entries);
      expect(result).toHaveLength(1);
      expect(result[0].institution).toBe("MIT");
      expect(mockGet).toHaveBeenCalledWith("/cv/education");
    });

    it("returns empty array when no education entries exist", async () => {
      mockGet.mockResolvedValue({ data: [] });

      const { listEducation } = await loadRepo();
      const result = await listEducation();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  // =========================================================================
  // createEducation
  // =========================================================================
  describe("createEducation", () => {
    it("calls POST /cv/education with body and returns created entry", async () => {
      const input = { institution: "MIT", degree: "BSc CS", field: "AI", startDate: "2020-09-01", endDate: "2024-06-01" };
      const created = { id: "edu-123", userId: "u1", ...input };
      mockPost.mockResolvedValue({ data: created });

      const { createEducation } = await loadRepo();
      const result = await createEducation(input);

      expect(result).toEqual(created);
      expect(result.field).toBe("AI");
      expect(mockPost).toHaveBeenCalledWith("/cv/education", input);
    });
  });

  // =========================================================================
  // updateEducation
  // =========================================================================
  describe("updateEducation", () => {
    it("calls PUT /cv/education/:id with body and returns updated entry", async () => {
      const input = { degree: "MSc CS" };
      const updated = { id: "edu-123", userId: "u1", institution: "MIT", degree: "MSc CS", startDate: "2020-09-01" };
      mockPut.mockResolvedValue({ data: updated });

      const { updateEducation } = await loadRepo();
      const result = await updateEducation("edu-123", input);

      expect(result).toEqual(updated);
      expect(result.degree).toBe("MSc CS");
      expect(mockPut).toHaveBeenCalledWith("/cv/education/edu-123", input);
    });
  });

  // =========================================================================
  // deleteEducation
  // =========================================================================
  describe("deleteEducation", () => {
    it("calls DELETE /cv/education/:id", async () => {
      mockDelete.mockResolvedValue({ data: undefined });

      const { deleteEducation } = await loadRepo();
      await deleteEducation("edu-123");

      expect(mockDelete).toHaveBeenCalledWith("/cv/education/edu-123");
    });
  });

  // =========================================================================
  // generateCV
  // =========================================================================
  describe("generateCV", () => {
    it("calls POST /cv/generate with body and returns generated CV", async () => {
      const input = {
        sectionOrder: ["summary", "experience", "skills"],
        jobDescription: "Senior FE role",
      };
      const response = {
        sections: [
          { heading: "Summary", body: "Experienced engineer...", order: 0 },
          { heading: "Skills", body: "- React\n- TypeScript", order: 1 },
        ],
        metadata: { generatedAt: "2026-07-12T00:00:00.000Z", model: "groq-llama", sectionCount: 2 },
      };
      mockPost.mockResolvedValue({ data: response });

      const { generateCV } = await loadRepo();
      const result = await generateCV(input);

      expect(result).toEqual(response);
      expect(result.sections).toHaveLength(2);
      expect(result.sections[0].heading).toBe("Summary");
      expect(mockPost).toHaveBeenCalledWith("/cv/generate", input);
    });

    it("accepts empty body for generation with defaults", async () => {
      const response = {
        sections: [{ heading: "Summary", body: "Default CV", order: 0 }],
        metadata: { generatedAt: "2026-07-12T00:00:00.000Z", model: "groq-llama", sectionCount: 1 },
      };
      mockPost.mockResolvedValue({ data: response });

      const { generateCV } = await loadRepo();
      const result = await generateCV({});

      expect(result.metadata.sectionCount).toBe(1);
      expect(mockPost).toHaveBeenCalledWith("/cv/generate", {});
    });
  });
});
