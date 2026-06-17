import { beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mock factories (hoisted before imports)
// ---------------------------------------------------------------------------
const { mockPrisma, mockDbNull } = vi.hoisted(() => ({
  mockDbNull: "___DB_NULL___",
  mockPrisma: {
    analysis: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@prisma/client", () => ({
  Prisma: { DbNull: mockDbNull },
  PrismaClient: vi.fn(),
}));

vi.mock("../infra/prisma.js", () => ({
  prisma: mockPrisma,
}));

// ---------------------------------------------------------------------------
// Subject imports (after mocks)
// ---------------------------------------------------------------------------
import { getAll, getById, remove, update, saveAnalysis } from "./history.service.js";
import { AppError } from "../infra/error-handler.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "analysis-1",
    userId: "user-1",
    jobDescription: "Senior React Developer",
    summary: "Strong candidate with React expertise",
    vacancySummary: JSON.stringify({ title: "Senior React Dev", location: "Remote" }),
    skillGroups: [{ category: "Frontend", skills: [{ name: "React", level: "expert" }] }],
    keywords: { mustHave: ["React", "TypeScript"], niceToHave: ["GraphQL"] },
    gaps: [{ skill: "Docker", priority: "medium" }],
    recruiterMessages: null,
    outreachMessage: JSON.stringify({ subject: "Exciting Opportunity", body: "We think you'd be a great fit..." }),
    displayName: null,
    notes: null,
    tone: "professional",
    createdAt: new Date("2026-06-15T10:00:00.000Z"),
    updatedAt: new Date("2026-06-15T10:00:00.000Z"),
    ...overrides,
  };
}

function expectedDeserialized(overrides: Record<string, unknown> = {}) {
  return {
    id: "analysis-1",
    jobDescription: "Senior React Developer",
    summary: "Strong candidate with React expertise",
    vacancySummary: { title: "Senior React Dev", location: "Remote" },
    skillGroups: [{ category: "Frontend", skills: [{ name: "React", level: "expert" }] }],
    keywords: { mustHave: ["React", "TypeScript"], niceToHave: ["GraphQL"] },
    gaps: [{ skill: "Docker", priority: "medium" }],
    recruiterMessages: null,
    outreachMessage: { subject: "Exciting Opportunity", body: "We think you'd be a great fit..." },
    displayName: null,
    notes: null,
    tone: "professional",
    createdAt: "2026-06-15T10:00:00.000Z",
    updatedAt: "2026-06-15T10:00:00.000Z",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("history.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // getAll
  // =========================================================================

  describe("getAll", () => {
    it("calls findMany with userId and returns deserialized results", async () => {
      const rows = [createMockRow()];
      mockPrisma.analysis.findMany.mockResolvedValue(rows);

      const result = await getAll("user-1");

      expect(result).toEqual([expectedDeserialized()]);
      expect(mockPrisma.analysis.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        orderBy: { createdAt: "desc" },
      });
    });

    it("returns empty array when user has no analyses", async () => {
      mockPrisma.analysis.findMany.mockResolvedValue([]);
      expect(await getAll("user-1")).toEqual([]);
    });

    it("handles multiple analyses in correct order", async () => {
      const row1 = createMockRow({ id: "a", createdAt: new Date("2026-06-15T10:00:00.000Z") });
      const row2 = createMockRow({ id: "b", createdAt: new Date("2026-06-15T12:00:00.000Z") });
      mockPrisma.analysis.findMany.mockResolvedValue([row1, row2]);

      const result = await getAll("user-1");
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("a");
      expect(result[1].id).toBe("b");
    });
  });

  // =========================================================================
  // getById
  // =========================================================================

  describe("getById", () => {
    it("returns deserialized analysis when found with matching userId", async () => {
      mockPrisma.analysis.findFirst.mockResolvedValue(createMockRow());

      const result = await getById("user-1", "analysis-1");

      expect(result).toEqual(expectedDeserialized());
      expect(mockPrisma.analysis.findFirst).toHaveBeenCalledWith({
        where: { id: "analysis-1", userId: "user-1" },
      });
    });

    it("throws AppError 404 when analysis is not found", async () => {
      mockPrisma.analysis.findFirst.mockResolvedValue(null);

      await expect(getById("user-1", "nonexistent")).rejects.toThrow(AppError);
      await expect(getById("user-1", "nonexistent")).rejects.toMatchObject({
        statusCode: 404,
        message: "Analysis not found",
      });
    });

    it("throws AppError 404 when userId does not match (scoping)", async () => {
      mockPrisma.analysis.findFirst.mockResolvedValue(null);

      await expect(getById("other-user", "analysis-1")).rejects.toThrow(AppError);
      await expect(getById("other-user", "analysis-1")).rejects.toMatchObject({
        statusCode: 404,
        message: "Analysis not found",
      });
    });
  });

  // =========================================================================
  // remove
  // =========================================================================

  describe("remove", () => {
    it("finds and deletes analysis when userId matches", async () => {
      mockPrisma.analysis.findFirst.mockResolvedValue(createMockRow());

      await remove("user-1", "analysis-1");

      expect(mockPrisma.analysis.findFirst).toHaveBeenCalledWith({
        where: { id: "analysis-1", userId: "user-1" },
      });
      expect(mockPrisma.analysis.delete).toHaveBeenCalledWith({
        where: { id: "analysis-1" },
      });
    });

    it("throws AppError 404 when analysis not found", async () => {
      mockPrisma.analysis.findFirst.mockResolvedValue(null);

      await expect(remove("user-1", "nonexistent")).rejects.toThrow(AppError);
      await expect(remove("user-1", "nonexistent")).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it("does NOT call delete when findFirst returns null", async () => {
      mockPrisma.analysis.findFirst.mockResolvedValue(null);

      await expect(remove("user-1", "nonexistent")).rejects.toThrow(AppError);
      expect(mockPrisma.analysis.delete).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // update
  // =========================================================================

  describe("update", () => {
    it("updates and returns deserialized analysis", async () => {
      mockPrisma.analysis.findFirst.mockResolvedValue(createMockRow());
      const updatedRow = createMockRow({
        displayName: "Updated Name",
        notes: "Updated notes",
      });
      mockPrisma.analysis.update.mockResolvedValue(updatedRow);

      const result = await update("user-1", "analysis-1", {
        displayName: "Updated Name",
        notes: "Updated notes",
      });

      expect(result).toEqual(
        expectedDeserialized({
          displayName: "Updated Name",
          notes: "Updated notes",
        }),
      );
      expect(mockPrisma.analysis.findFirst).toHaveBeenCalledWith({
        where: { id: "analysis-1", userId: "user-1" },
      });
      expect(mockPrisma.analysis.update).toHaveBeenCalledWith({
        where: { id: "analysis-1" },
        data: { displayName: "Updated Name", notes: "Updated notes" },
      });
    });

    it("throws AppError 404 when analysis not found", async () => {
      mockPrisma.analysis.findFirst.mockResolvedValue(null);

      await expect(update("user-1", "nonexistent", { displayName: "Nope" })).rejects.toThrow(AppError);
      await expect(update("user-1", "nonexistent", { displayName: "Nope" })).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it("does NOT call update when findFirst returns null", async () => {
      mockPrisma.analysis.findFirst.mockResolvedValue(null);

      await expect(update("user-1", "nonexistent", { displayName: "Nope" })).rejects.toThrow(AppError);
      expect(mockPrisma.analysis.update).not.toHaveBeenCalled();
    });

    it("passes partial data object (only displayName)", async () => {
      mockPrisma.analysis.findFirst.mockResolvedValue(createMockRow());
      mockPrisma.analysis.update.mockResolvedValue(createMockRow({ displayName: "Only name" }));

      await update("user-1", "analysis-1", { displayName: "Only name" });

      expect(mockPrisma.analysis.update).toHaveBeenCalledWith({
        where: { id: "analysis-1" },
        data: { displayName: "Only name" },
      });
    });

    it("passes partial data object (only notes)", async () => {
      mockPrisma.analysis.findFirst.mockResolvedValue(createMockRow());
      mockPrisma.analysis.update.mockResolvedValue(createMockRow({ notes: "Only notes" }));

      await update("user-1", "analysis-1", { notes: "Only notes" });

      expect(mockPrisma.analysis.update).toHaveBeenCalledWith({
        where: { id: "analysis-1" },
        data: { notes: "Only notes" },
      });
    });
  });

  // =========================================================================
  // saveAnalysis
  // =========================================================================

  describe("saveAnalysis", () => {
    // Valid AnalysisResponseDTO fixture that matches the shared schema
    const validResult = {
      id: "new-id",
      summary: "Great summary",
      vacancySummary: {
        role: "Senior Dev",
        seniority: "Senior",
        modalityLocation: "Remote",
        responsibilities: ["Build features"],
        mustHave: ["React"],
        niceToHave: ["GraphQL"],
      },
      skillGroups: [
        { category: "Core", skills: [{ name: "React", level: "core" as const }] },
      ],
      keywords: {
        hardSkills: ["React"],
        softSkills: ["Communication"],
        domainKeywords: ["Frontend"],
        atsTerms: ["SPA"],
      },
      gaps: [{ gap: "Testing", mitigation: "Learn Vitest", framing: "Growth area" }],
      recruiterMessages: {
        emailLinkedIn: { subject: "Hi", body: "Hello" },
        dmShort: { body: "Short DM message" },
      },
      outreachMessage: { subject: "Offer", body: "Join us" },
      displayName: "Custom name" as string | undefined,
      notes: "Important candidate" as string | undefined,
      createdAt: "2026-06-15T12:00:00.000Z",
    };

    const fullPayload = {
      jobDescription: "Senior React Developer",
      result: validResult,
    };

    it("creates analysis with correct data shape", async () => {
      await saveAnalysis("user-1", fullPayload);

      expect(mockPrisma.analysis.create).toHaveBeenCalledWith({
        data: {
          id: "new-id",
          userId: "user-1",
          jobDescription: "Senior React Developer",
          summary: "Great summary",
          vacancySummary: JSON.stringify({ role: "Senior Dev", seniority: "Senior", modalityLocation: "Remote", responsibilities: ["Build features"], mustHave: ["React"], niceToHave: ["GraphQL"] }),
          skillGroups: [{ category: "Core", skills: [{ name: "React", level: "core" }] }],
          keywords: {
            hardSkills: ["React"],
            softSkills: ["Communication"],
            domainKeywords: ["Frontend"],
            atsTerms: ["SPA"],
          },
          gaps: [{ gap: "Testing", mitigation: "Learn Vitest", framing: "Growth area" }],
          recruiterMessages: {
            emailLinkedIn: { subject: "Hi", body: "Hello" },
            dmShort: { body: "Short DM message" },
          },
          outreachMessage: JSON.stringify({ subject: "Offer", body: "Join us" }),
          displayName: "Custom name",
          notes: "Important candidate",
          createdAt: new Date("2026-06-15T12:00:00.000Z"),
        },
      });
    });

    it("converts outreachMessage to JSON string when it is an object", async () => {
      await saveAnalysis("user-1", fullPayload);

      const call = mockPrisma.analysis.create.mock.calls[0][0];
      expect(call.data.outreachMessage).toBe(JSON.stringify({ subject: "Offer", body: "Join us" }));
    });

    it("passes outreachMessage as-is when it is already a string", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        jobDescription: "Job",
        result: {
          id: "id",
          summary: "Summary text",
          vacancySummary: {},
          skillGroups: [{ category: "C", skills: [{ name: "X", level: "core" }] }],
          keywords: { hardSkills: ["A"], softSkills: ["B"], domainKeywords: ["C"], atsTerms: ["D"] },
          gaps: [{ gap: "G", mitigation: "M", framing: "F" }],
          recruiterMessages: {
            emailLinkedIn: { subject: "S", body: "B" },
            dmShort: { body: "DM" },
          },
          outreachMessage: "Already a string message",
          displayName: "Custom" as string | undefined,
          notes: "Notes" as string | undefined,
          createdAt: "2026-06-15T12:00:00.000Z",
        },
      };

      await saveAnalysis("user-1", payload);

      const call = mockPrisma.analysis.create.mock.calls[0][0];
      expect(call.data.outreachMessage).toBe("Already a string message");
    });

    it("stringifies null outreachMessage due to typeof null === object quirk", async () => {
      // typeof null === "object" → JSON.stringify(null) → "null"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        jobDescription: "Job",
        result: {
          id: "id",
          summary: "Summary",
          vacancySummary: {},
          skillGroups: [{ category: "C", skills: [{ name: "X", level: "core" }] }],
          keywords: { hardSkills: ["A"], softSkills: ["B"], domainKeywords: ["C"], atsTerms: ["D"] },
          gaps: [{ gap: "G", mitigation: "M", framing: "F" }],
          recruiterMessages: {
            emailLinkedIn: { subject: "S", body: "B" },
            dmShort: { body: "DM" },
          },
          outreachMessage: null,
          displayName: "Custom" as string | undefined,
          notes: "Notes" as string | undefined,
          createdAt: "2026-06-15T12:00:00.000Z",
        },
      };

      await saveAnalysis("user-1", payload);

      const call = mockPrisma.analysis.create.mock.calls[0][0];
      expect(call.data.outreachMessage).toBe("null");
    });

    it("defaults undefined outreachMessage to empty string via ?? fallback", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        jobDescription: "Job",
        result: {
          id: "id",
          summary: "Summary",
          vacancySummary: {},
          skillGroups: [{ category: "C", skills: [{ name: "X", level: "core" }] }],
          keywords: { hardSkills: ["A"], softSkills: ["B"], domainKeywords: ["C"], atsTerms: ["D"] },
          gaps: [{ gap: "G", mitigation: "M", framing: "F" }],
          recruiterMessages: {
            emailLinkedIn: { subject: "S", body: "B" },
            dmShort: { body: "DM" },
          },
          outreachMessage: undefined,
          displayName: "Custom" as string | undefined,
          notes: "Notes" as string | undefined,
          createdAt: "2026-06-15T12:00:00.000Z",
        },
      };

      await saveAnalysis("user-1", payload);

      const call = mockPrisma.analysis.create.mock.calls[0][0];
      expect(call.data.outreachMessage).toBe("");
    });

    it("uses Prisma.DbNull when recruiterMessages is null", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        jobDescription: "Job",
        result: {
          id: "id",
          summary: "Summary",
          vacancySummary: {},
          skillGroups: [{ category: "C", skills: [{ name: "X", level: "core" }] }],
          keywords: { hardSkills: ["A"], softSkills: ["B"], domainKeywords: ["C"], atsTerms: ["D"] },
          gaps: [{ gap: "G", mitigation: "M", framing: "F" }],
          recruiterMessages: null,
          outreachMessage: "test",
          displayName: "Custom" as string | undefined,
          notes: "Notes" as string | undefined,
          createdAt: "2026-06-15T12:00:00.000Z",
        },
      };

      await saveAnalysis("user-1", payload);

      const call = mockPrisma.analysis.create.mock.calls[0][0];
      expect(call.data.recruiterMessages).toBe(mockDbNull);
    });

    it("passes recruiterMessages object when provided (non-null)", async () => {
      await saveAnalysis("user-1", fullPayload);

      const call = mockPrisma.analysis.create.mock.calls[0][0];
      expect(call.data.recruiterMessages).toEqual({
        emailLinkedIn: { subject: "Hi", body: "Hello" },
        dmShort: { body: "Short DM message" },
      });
    });

    it("defaults displayName and notes to null when not provided", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        jobDescription: "Job",
        result: {
          id: "id",
          summary: "Summary",
          vacancySummary: {},
          skillGroups: [{ category: "C", skills: [{ name: "X", level: "core" }] }],
          keywords: { hardSkills: ["A"], softSkills: ["B"], domainKeywords: ["C"], atsTerms: ["D"] },
          gaps: [{ gap: "G", mitigation: "M", framing: "F" }],
          recruiterMessages: {
            emailLinkedIn: { subject: "S", body: "B" },
            dmShort: { body: "DM" },
          },
          outreachMessage: "msg",
          displayName: undefined,
          notes: undefined,
          createdAt: "2026-06-15T12:00:00.000Z",
        },
      };

      await saveAnalysis("user-1", payload);

      const call = mockPrisma.analysis.create.mock.calls[0][0];
      expect(call.data.displayName).toBeNull();
      expect(call.data.notes).toBeNull();
    });

    it("converts createdAt string to Date object", async () => {
      await saveAnalysis("user-1", fullPayload);

      const call = mockPrisma.analysis.create.mock.calls[0][0];
      expect(call.data.createdAt).toEqual(new Date("2026-06-15T12:00:00.000Z"));
    });
  });

  // =========================================================================
  // deserialize (tested through service functions)
  // =========================================================================

  describe("deserialize", () => {
    it("parses vacancySummary JSON string to object", async () => {
      mockPrisma.analysis.findMany.mockResolvedValue([
        createMockRow({ vacancySummary: JSON.stringify({ title: "Dev", salary: 100 }) }),
      ]);

      const [result] = await getAll("user-1");
      expect(result.vacancySummary).toEqual({ title: "Dev", salary: 100 });
    });

    it("handles vacancySummary parse error gracefully", async () => {
      mockPrisma.analysis.findMany.mockResolvedValue([
        createMockRow({ vacancySummary: "not-valid-json" }),
      ]);

      const [result] = await getAll("user-1");
      expect(result.vacancySummary).toEqual({});
    });

    it("parses outreachMessage JSON string to object", async () => {
      mockPrisma.analysis.findMany.mockResolvedValue([
        createMockRow({ outreachMessage: JSON.stringify({ subject: "Test", body: "Body" }) }),
      ]);

      const [result] = await getAll("user-1");
      expect(result.outreachMessage).toEqual({ subject: "Test", body: "Body" });
    });

    it("falls back to raw string for non-JSON outreachMessage", async () => {
      mockPrisma.analysis.findMany.mockResolvedValue([
        createMockRow({ outreachMessage: "Just a plain text message" }),
      ]);

      const [result] = await getAll("user-1");
      expect(result.outreachMessage).toBe("Just a plain text message");
    });

    it("converts Date fields to ISO strings", async () => {
      mockPrisma.analysis.findMany.mockResolvedValue([createMockRow()]);

      const [result] = await getAll("user-1");
      expect(result.createdAt).toBe("2026-06-15T10:00:00.000Z");
      expect(result.updatedAt).toBe("2026-06-15T10:00:00.000Z");
    });
  });
});
