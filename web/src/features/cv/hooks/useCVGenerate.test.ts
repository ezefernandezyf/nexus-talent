import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClientWrapper } from "@/test/mocks/query-client";
import * as cvRepository from "@/features/cv/api/cv-repository";

vi.mock("@/features/cv/api/cv-repository", () => ({
  generateCV: vi.fn(),
}));

const mockGenerateCV = vi.mocked(cvRepository.generateCV);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useCVGenerate", () => {
  it("calls generateCV mutation and returns generated CV", async () => {
    const response = {
      sections: [
        { heading: "Summary", body: "Experienced engineer...", order: 0 },
        { heading: "Skills", body: "- React\n- TypeScript", order: 1 },
      ],
      metadata: { generatedAt: "2026-07-12T00:00:00.000Z", model: "groq-llama", sectionCount: 2 },
    };
    mockGenerateCV.mockResolvedValue(response);

    const { useCVGenerate } = await import("./useCVGenerate");
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useCVGenerate(), { wrapper });

    const data = await result.current.mutateAsync({
      sectionOrder: ["summary", "skills"],
      jobDescription: "Senior FE role",
    });

    expect(data).toEqual(response);
    expect(data.sections).toHaveLength(2);
    expect(data.sections[0].heading).toBe("Summary");
    expect(mockGenerateCV).toHaveBeenCalledTimes(1);
    // First arg is the input data; extra args are React Query internal context
    expect(mockGenerateCV.mock.calls[0][0]).toEqual({
      sectionOrder: ["summary", "skills"],
      jobDescription: "Senior FE role",
    });
  });

  it("accepts empty body for generation with defaults", async () => {
    const response = {
      sections: [{ heading: "Summary", body: "Default CV", order: 0 }],
      metadata: { generatedAt: "2026-07-12T00:00:00.000Z", model: "groq-llama", sectionCount: 1 },
    };
    mockGenerateCV.mockResolvedValue(response);

    const { useCVGenerate } = await import("./useCVGenerate");
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useCVGenerate(), { wrapper });

    const data = await result.current.mutateAsync({});

    expect(data.metadata.sectionCount).toBe(1);
    expect(mockGenerateCV).toHaveBeenCalledTimes(1);
    expect(mockGenerateCV.mock.calls[0][0]).toEqual({});
  });

  it("exposes loading and error states", async () => {
    mockGenerateCV.mockRejectedValue(new Error("Generation failed"));

    const { useCVGenerate } = await import("./useCVGenerate");
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useCVGenerate(), { wrapper });

    result.current.mutate({});
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
