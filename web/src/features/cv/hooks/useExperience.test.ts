import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createTestQueryClient, createQueryClientWrapper } from "@/test/mocks/query-client";
import * as cvRepository from "@/features/cv/api/cv-repository";

vi.mock("@/features/cv/api/cv-repository", () => ({
  listExperience: vi.fn(),
  createExperience: vi.fn(),
  updateExperience: vi.fn(),
  deleteExperience: vi.fn(),
}));

const mockListExperience = vi.mocked(cvRepository.listExperience);
const mockCreateExperience = vi.mocked(cvRepository.createExperience);
const mockUpdateExperience = vi.mocked(cvRepository.updateExperience);
const mockDeleteExperience = vi.mocked(cvRepository.deleteExperience);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useExperience", () => {
  it("returns list of experience entries via useQuery", async () => {
    const entries = [
      { id: "1", userId: "u1", company: "Acme", role: "Senior Dev", startDate: "2023-01-01" },
      { id: "2", userId: "u1", company: "StartupCo", role: "Junior Dev", startDate: "2021-06-01" },
    ];
    mockListExperience.mockResolvedValue(entries);

    const { useExperience } = await import("./useExperience");
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useExperience(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(entries);
    expect(result.current.data).toHaveLength(2);
    expect(mockListExperience).toHaveBeenCalledTimes(1);
  });

  it("returns empty array when no experience entries exist", async () => {
    mockListExperience.mockResolvedValue([]);

    const { useExperience } = await import("./useExperience");
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useExperience(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("createExperience mutation calls repository with input data", async () => {
    mockListExperience.mockResolvedValue([]);
    mockCreateExperience.mockResolvedValue({
      id: "new-1",
      userId: "u1",
      company: "Nexus",
      role: "CTO",
      startDate: "2024-01-01",
    });

    const { useExperience } = await import("./useExperience");
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useExperience(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const returned = await result.current.createMutation.mutateAsync({
      company: "Nexus",
      role: "CTO",
      startDate: "2024-01-01",
    });

    expect(returned.id).toBe("new-1");
    expect(returned.company).toBe("Nexus");
    // First arg is the input data; extra args are React Query internal context
    expect(mockCreateExperience.mock.calls[0][0]).toEqual({
      company: "Nexus",
      role: "CTO",
      startDate: "2024-01-01",
    });
  });

  it("updateExperience mutation calls repository with id and data", async () => {
    mockUpdateExperience.mockResolvedValue({
      id: "1",
      userId: "u1",
      company: "Acme",
      role: "Senior CTO",
      startDate: "2023-01-01",
    });
    mockListExperience.mockResolvedValue([]);

    const { useExperience } = await import("./useExperience");
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useExperience(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const returned = await result.current.updateMutation.mutateAsync({
      id: "1",
      data: { role: "Senior CTO" },
    });

    expect(returned.role).toBe("Senior CTO");
    expect(mockUpdateExperience).toHaveBeenCalledWith("1", { role: "Senior CTO" });
  });

  it("deleteExperience mutation calls repository with id", async () => {
    mockDeleteExperience.mockResolvedValue(undefined);
    mockListExperience.mockResolvedValue([]);

    const { useExperience } = await import("./useExperience");
    const wrapper = createQueryClientWrapper();
    const { result } = renderHook(() => useExperience(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await result.current.deleteMutation.mutateAsync("1");

    // First arg is the id; extra args are React Query internal context
    expect(mockDeleteExperience.mock.calls[0][0]).toBe("1");
  });
});
