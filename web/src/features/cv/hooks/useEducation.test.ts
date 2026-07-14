import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createQueryClientWrapper } from "@/test/mocks/query-client";
import * as cvRepository from "@/features/cv/api/cv-repository";

vi.mock("@/features/cv/api/cv-repository", () => ({
  listEducation: vi.fn(),
  createEducation: vi.fn(),
  updateEducation: vi.fn(),
  deleteEducation: vi.fn(),
}));

const mockListEducation = vi.mocked(cvRepository.listEducation);
const mockCreateEducation = vi.mocked(cvRepository.createEducation);
const mockUpdateEducation = vi.mocked(cvRepository.updateEducation);
const mockDeleteEducation = vi.mocked(cvRepository.deleteEducation);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useEducation", () => {
  it("returns list of education entries via useQuery", async () => {
    const entries = [
      { id: "1", userId: "u1", institution: "MIT", degree: "BSc CS", startDate: "2020-09-01" },
    ];
    mockListEducation.mockResolvedValue(entries);

    const { useEducation } = await import("./useEducation");
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useEducation(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(entries);
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].institution).toBe("MIT");
    expect(mockListEducation).toHaveBeenCalledTimes(1);
  });

  it("returns empty array when no education entries exist", async () => {
    mockListEducation.mockResolvedValue([]);

    const { useEducation } = await import("./useEducation");
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useEducation(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("createEducation mutation calls repository with input data", async () => {
    mockListEducation.mockResolvedValue([]);
    mockCreateEducation.mockResolvedValue({
      id: "new-1",
      userId: "u1",
      institution: "MIT",
      degree: "BSc CS",
      startDate: "2020-09-01",
    });

    const { useEducation } = await import("./useEducation");
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useEducation(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const returned = await result.current.createMutation.mutateAsync({
      institution: "MIT",
      degree: "BSc CS",
      startDate: "2020-09-01",
    });

    expect(returned.id).toBe("new-1");
    expect(returned.institution).toBe("MIT");
    // First arg is the input data; extra args are React Query internal context
    expect(mockCreateEducation.mock.calls[0][0]).toEqual({
      institution: "MIT",
      degree: "BSc CS",
      startDate: "2020-09-01",
    });
  });

  it("updateEducation mutation calls repository with id and data", async () => {
    mockUpdateEducation.mockResolvedValue({
      id: "1",
      userId: "u1",
      institution: "MIT",
      degree: "MSc CS",
      startDate: "2020-09-01",
    });
    mockListEducation.mockResolvedValue([]);

    const { useEducation } = await import("./useEducation");
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useEducation(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const returned = await result.current.updateMutation.mutateAsync({
      id: "1",
      data: { degree: "MSc CS" },
    });

    expect(returned.degree).toBe("MSc CS");
    expect(mockUpdateEducation).toHaveBeenCalledWith("1", { degree: "MSc CS" });
  });

  it("deleteEducation mutation calls repository with id", async () => {
    mockDeleteEducation.mockResolvedValue(undefined);
    mockListEducation.mockResolvedValue([]);

    const { useEducation } = await import("./useEducation");
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useEducation(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await result.current.deleteMutation.mutateAsync("1");

    // First arg is the id; extra args are React Query internal context
    expect(mockDeleteEducation.mock.calls[0][0]).toBe("1");
  });
});
