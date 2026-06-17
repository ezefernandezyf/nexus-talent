import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHttpAnalysisRepository } from "./http-analysis-repository";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(data),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("createHttpAnalysisRepository", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn();
  });

  // =========================================================================
  // save
  // =========================================================================

  describe("save", () => {
    it("returns pass-through SavedJobAnalysis without calling fetch", async () => {
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
      expect(globalThis.fetch).not.toHaveBeenCalled();
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
    it("calls GET /api/analyses and returns items", async () => {
      const items = [{ id: "1", summary: "A" }];
      (globalThis.fetch as any).mockResolvedValue(mockResponse({ items, total: 1 }));

      const result = await createHttpAnalysisRepository().getAll();

      expect(result).toEqual(items);
      expect(globalThis.fetch).toHaveBeenCalledWith("/api/analyses", {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    });

    it("includes credentials and content-type headers", async () => {
      (globalThis.fetch as any).mockResolvedValue(mockResponse({ items: [], total: 0 }));

      await createHttpAnalysisRepository().getAll();

      const callArgs = (globalThis.fetch as any).mock.calls[0][1];
      expect(callArgs.credentials).toBe("include");
      expect(callArgs.headers["Content-Type"]).toBe("application/json");
    });

    it("throws on non-ok response with error message from body", async () => {
      (globalThis.fetch as any).mockResolvedValue(mockResponse({ error: "Unauthorized" }, 401));

      await expect(createHttpAnalysisRepository().getAll()).rejects.toThrow("Unauthorized");
    });

    it("throws with status fallback when response body has no error field", async () => {
      (globalThis.fetch as any).mockResolvedValue(mockResponse({}, 500));

      await expect(createHttpAnalysisRepository().getAll()).rejects.toThrow(
        "Request failed with status 500",
      );
    });

    it("throws when JSON parsing of error response fails", async () => {
      const badResponse = {
        ok: false,
        status: 400,
        json: vi.fn().mockRejectedValue(new SyntaxError("Unexpected token")),
      };
      (globalThis.fetch as any).mockResolvedValue(badResponse);

      await expect(createHttpAnalysisRepository().getAll()).rejects.toThrow(
        "Request failed with status 400",
      );
    });
  });

  // =========================================================================
  // getById
  // =========================================================================

  describe("getById", () => {
    it("calls GET /api/analyses/:id and returns data", async () => {
      const data = { id: "42", summary: "Detail" };
      (globalThis.fetch as any).mockResolvedValue(mockResponse(data));

      const result = await createHttpAnalysisRepository().getById("42");

      expect(result).toEqual(data);
      expect(globalThis.fetch).toHaveBeenCalledWith("/api/analyses/42", {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    });

    it("returns null on network error", async () => {
      (globalThis.fetch as any).mockRejectedValue(new Error("Network failure"));

      expect(await createHttpAnalysisRepository().getById("1")).toBeNull();
    });

    it("returns null on non-ok response", async () => {
      (globalThis.fetch as any).mockResolvedValue(mockResponse(null, 404));

      expect(await createHttpAnalysisRepository().getById("1")).toBeNull();
    });

    it("still sends credentials and headers on GET-by-id", async () => {
      (globalThis.fetch as any).mockResolvedValue(mockResponse({ id: "1" }));

      await createHttpAnalysisRepository().getById("1");

      const callArgs = (globalThis.fetch as any).mock.calls[0][1];
      expect(callArgs.credentials).toBe("include");
      expect(callArgs.headers["Content-Type"]).toBe("application/json");
    });
  });

  // =========================================================================
  // update
  // =========================================================================

  describe("update", () => {
    it("calls PATCH /api/analyses/:id with JSON body and returns data", async () => {
      const data = { id: "1", displayName: "Renamed", notes: "New notes" };
      (globalThis.fetch as any).mockResolvedValue(mockResponse(data));

      const result = await createHttpAnalysisRepository().update("1", {
        displayName: "Renamed",
        notes: "New notes",
      });

      expect(result).toEqual(data);
      expect(globalThis.fetch).toHaveBeenCalledWith("/api/analyses/1", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: "Renamed", notes: "New notes" }),
      });
    });

    it("returns null on network error", async () => {
      (globalThis.fetch as any).mockRejectedValue(new Error("Network failure"));

      expect(await createHttpAnalysisRepository().update("1", { displayName: "X" })).toBeNull();
    });

    it("returns null on non-ok response", async () => {
      (globalThis.fetch as any).mockResolvedValue(mockResponse(null, 400));

      expect(await createHttpAnalysisRepository().update("1", { displayName: "X" })).toBeNull();
    });

    it("still sends credentials and content-type on PATCH", async () => {
      (globalThis.fetch as any).mockResolvedValue(mockResponse({ id: "1" }));

      await createHttpAnalysisRepository().update("1", { displayName: "X" });

      const callArgs = (globalThis.fetch as any).mock.calls[0][1];
      expect(callArgs.method).toBe("PATCH");
      expect(callArgs.credentials).toBe("include");
      expect(callArgs.headers["Content-Type"]).toBe("application/json");
      expect(callArgs.body).toBe(JSON.stringify({ displayName: "X" }));
    });
  });

  // =========================================================================
  // delete
  // =========================================================================

  describe("delete", () => {
    it("calls DELETE /api/analyses/:id and returns undefined on 204", async () => {
      (globalThis.fetch as any).mockResolvedValue(mockResponse(undefined, 204));

      const result = await createHttpAnalysisRepository().delete("1");

      expect(result).toBeUndefined();
      expect(globalThis.fetch).toHaveBeenCalledWith("/api/analyses/1", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    });

    it("throws on non-ok response", async () => {
      (globalThis.fetch as any).mockResolvedValue(mockResponse({ error: "Forbidden" }, 403));

      await expect(createHttpAnalysisRepository().delete("1")).rejects.toThrow("Forbidden");
    });

    it("stills sends credentials and headers on DELETE", async () => {
      (globalThis.fetch as any).mockResolvedValue(mockResponse(undefined, 204));

      await createHttpAnalysisRepository().delete("1");

      const callArgs = (globalThis.fetch as any).mock.calls[0][1];
      expect(callArgs.method).toBe("DELETE");
      expect(callArgs.credentials).toBe("include");
      expect(callArgs.headers["Content-Type"]).toBe("application/json");
    });
  });
});
