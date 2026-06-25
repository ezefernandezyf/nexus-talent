import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { createHttpAnalysisRepository } from "./http-repository";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("axios", () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
      isAxiosError: vi.fn((error: unknown) => (error as { isAxiosError?: boolean })?.isAxiosError ?? false),
    },
  };
});

const mockAxiosInstance = vi.mocked(axios.create());

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("createHttpAnalysisRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // save
  // =========================================================================

  describe("save", () => {
    it("returns pass-through SavedJobAnalysis without calling axios", async () => {
      const repo = createHttpAnalysisRepository();
      const input = {
        id: "abc-123",
        summary: "Test summary",
        createdAt: "2026-06-15T12:00:00.000Z",
      };

      const result = await repo.save("Senior React Dev", input as any);

      expect(result.id).toBe("abc-123");
      expect(result.jobDescription).toBe("Senior React Dev");
      expect(result.createdAt).toBe("2026-06-15T12:00:00.000Z");
      expect(result.summary).toBe("Test summary");
      expect(mockAxiosInstance.get).not.toHaveBeenCalled();
    });

    it("uses crypto.randomUUID when result has no id", async () => {
      vi.spyOn(crypto, "randomUUID").mockReturnValue("generated-uuid-1234");
      const repo = createHttpAnalysisRepository();

      const result = await repo.save("Job", {} as any);

      expect(result.id).toBe("generated-uuid-1234");
    });

    it("uses current ISO string when result has no createdAt", async () => {
      const fakeIso = "2026-07-01T00:00:00.000Z";
      vi.spyOn(Date.prototype, "toISOString").mockReturnValue(fakeIso);
      const repo = createHttpAnalysisRepository();

      const result = await repo.save("Job", { id: "x" } as any);

      expect(result.createdAt).toBe(fakeIso);
    });
  });

  // =========================================================================
  // getAll
  // =========================================================================

  describe("getAll", () => {
    it("calls GET /analyses and returns items with total", async () => {
      const items = [{ id: "1", summary: "A" }];
      (mockAxiosInstance.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { items, total: 1 } });

      const result = await createHttpAnalysisRepository().getAll();

      expect(result).toEqual({ items, total: 1 });
      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/analyses", { params: {} });
    });

    it("passes page and limit when provided", async () => {
      (mockAxiosInstance.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { items: [], total: 0 } });

      await createHttpAnalysisRepository().getAll({ page: 2, limit: 10 });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/analyses", { params: { page: "2", limit: "10" } });
    });

    it("throws on non-ok response with error message from body", async () => {
      (mockAxiosInstance.get as ReturnType<typeof vi.fn>).mockRejectedValue({
        isAxiosError: true,
        response: { status: 401, data: { error: "Unauthorized" } },
      });

      await expect(createHttpAnalysisRepository().getAll()).rejects.toThrow();
    });
  });

  // =========================================================================
  // getById
  // =========================================================================

  describe("getById", () => {
    it("calls GET /analyses/:id and returns data", async () => {
      const data = { id: "42", summary: "Detail" };
      (mockAxiosInstance.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data });

      const result = await createHttpAnalysisRepository().getById("42");

      expect(result).toEqual(data);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/analyses/42");
    });

    it("returns null on network error", async () => {
      (mockAxiosInstance.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network failure"));

      expect(await createHttpAnalysisRepository().getById("1")).toBeNull();
    });

    it("returns null on non-ok response", async () => {
      (mockAxiosInstance.get as ReturnType<typeof vi.fn>).mockRejectedValue({ response: { status: 404 } });

      expect(await createHttpAnalysisRepository().getById("1")).toBeNull();
    });
  });

  // =========================================================================
  // update
  // =========================================================================

  describe("update", () => {
    it("calls PATCH /analyses/:id with JSON body and returns data", async () => {
      const data = { id: "1", displayName: "Renamed", notes: "New notes" };
      (mockAxiosInstance.patch as ReturnType<typeof vi.fn>).mockResolvedValue({ data });

      const result = await createHttpAnalysisRepository().update("1", {
        displayName: "Renamed",
        notes: "New notes",
      });

      expect(result).toEqual(data);
      expect(mockAxiosInstance.patch).toHaveBeenCalledWith("/analyses/1", {
        displayName: "Renamed",
        notes: "New notes",
      });
    });

    it("returns null on network error", async () => {
      (mockAxiosInstance.patch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network failure"));

      expect(await createHttpAnalysisRepository().update("1", { displayName: "X" })).toBeNull();
    });

    it("returns null on non-ok response", async () => {
      (mockAxiosInstance.patch as ReturnType<typeof vi.fn>).mockRejectedValue({ response: { status: 400 } });

      expect(await createHttpAnalysisRepository().update("1", { displayName: "X" })).toBeNull();
    });
  });

  // =========================================================================
  // delete
  // =========================================================================

  describe("delete", () => {
    it("calls DELETE /analyses/:id and returns undefined on success", async () => {
      (mockAxiosInstance.delete as ReturnType<typeof vi.fn>).mockResolvedValue({ data: undefined });

      const result = await createHttpAnalysisRepository().delete("1");

      expect(result).toBeUndefined();
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith("/analyses/1");
    });

    it("throws on non-ok response", async () => {
      (mockAxiosInstance.delete as ReturnType<typeof vi.fn>).mockRejectedValue({
        isAxiosError: true,
        response: { status: 403, data: { error: "Forbidden" } },
      });

      await expect(createHttpAnalysisRepository().delete("1")).rejects.toThrow();
    });
  });
});
