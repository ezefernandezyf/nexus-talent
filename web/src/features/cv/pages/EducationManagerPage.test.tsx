import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "@/test/mocks/query-client";
import { EducationManagerPage } from "./EducationManagerPage";
import type { EducationDTO } from "@nexus-talent/shared";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

function makeMock() {
  return {
    data: undefined as EducationDTO[] | undefined,
    isLoading: true,
    isError: false,
    error: null,
    createMutation: { mutateAsync: mockCreate, isPending: false },
    updateMutation: { mutateAsync: mockUpdate, isPending: false },
    deleteMutation: { mutateAsync: mockDelete, isPending: false },
  };
}

function createMockUseEducation(overrides: Partial<ReturnType<typeof makeMock>> = {}) {
  return { ...makeMock(), ...overrides };
}

vi.mock("@/features/cv/hooks/useEducation", () => ({
  useEducation: vi.fn(),
}));

import { useEducation } from "@/features/cv/hooks/useEducation";
const mockUseEducation = vi.mocked(useEducation);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderPage() {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <EducationManagerPage />
    </QueryClientProvider>,
  );
}

const sampleEntries: EducationDTO[] = [
  {
    id: "1",
    userId: "u1",
    institution: "MIT",
    degree: "BSc Computer Science",
    field: "Artificial Intelligence",
    startDate: "2020-09-01",
    endDate: "2024-06-01",
    description: "Graduated with honors",
  },
  {
    id: "2",
    userId: "u1",
    institution: "Stanford",
    degree: "MSc CS",
    field: null,
    startDate: "2024-09-01",
    endDate: null,
    description: null,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("EducationManagerPage", () => {
  it("shows loading state when data is being fetched", () => {
    mockUseEducation.mockReturnValue(createMockUseEducation({ isLoading: true, data: undefined }) as any);

    renderPage();

    expect(screen.getByTestId("education-skeleton")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("shows empty state when no education entries exist", () => {
    mockUseEducation.mockReturnValue(
      createMockUseEducation({ isLoading: false, data: [], isError: false }) as any,
    );

    renderPage();

    expect(screen.getByText(/no hay educación/i)).toBeInTheDocument();
  });

  it("shows error state when query fails", () => {
    mockUseEducation.mockReturnValue(
      createMockUseEducation({
        isLoading: false,
        data: undefined,
        isError: true,
        error: new Error("Failed to fetch"),
      }) as any,
    );

    renderPage();

    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it("renders list of education entries", async () => {
    mockUseEducation.mockReturnValue(
      createMockUseEducation({ isLoading: false, data: sampleEntries, isError: false }) as any,
    );

    renderPage();

    expect(screen.getByText("MIT")).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes("BSc Computer Science"))).toBeInTheDocument();
    expect(screen.getByText("Stanford")).toBeInTheDocument();
    expect(screen.getByText("MSc CS")).toBeInTheDocument();
  });

  it("shows add form when clicking 'Add Education' button", async () => {
    const user = userEvent.setup();
    mockUseEducation.mockReturnValue(
      createMockUseEducation({ isLoading: false, data: [], isError: false }) as any,
    );

    renderPage();

    const addButton = screen.getByRole("button", { name: /add education/i });
    await user.click(addButton);

    expect(screen.getByLabelText(/institution/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/degree/i)).toBeInTheDocument();
  });

  it("calls createMutation when add form is submitted", async () => {
    const user = userEvent.setup();
    mockCreate.mockResolvedValue({ id: "new-1", userId: "u1", institution: "Harvard", degree: "BA", startDate: "2024-01-01" });
    mockUseEducation.mockReturnValue(
      createMockUseEducation({ isLoading: false, data: [], isError: false }) as any,
    );

    renderPage();

    await user.click(screen.getByRole("button", { name: /add education/i }));
    await user.type(screen.getByLabelText(/institution/i), "Harvard");
    await user.type(screen.getByLabelText(/degree/i), "BA");
    await user.type(screen.getByLabelText(/start date/i), "2024-01-01");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        institution: "Harvard",
        degree: "BA",
        startDate: "2024-01-01",
        field: null,
        endDate: null,
        description: null,
      });
    });
  });

  it("shows edit form when clicking edit button on an entry", async () => {
    const user = userEvent.setup();
    mockUseEducation.mockReturnValue(
      createMockUseEducation({ isLoading: false, data: sampleEntries, isError: false }) as any,
    );

    renderPage();

    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    await user.click(editButtons[0]);

    expect(screen.getByDisplayValue("MIT")).toBeInTheDocument();
    expect(screen.getByDisplayValue("BSc Computer Science")).toBeInTheDocument();
  });

  it("calls updateMutation when edit form is submitted", async () => {
    const user = userEvent.setup();
    mockUpdate.mockResolvedValue({ ...sampleEntries[0], degree: "BSc Engineering" });
    mockUseEducation.mockReturnValue(
      createMockUseEducation({ isLoading: false, data: sampleEntries, isError: false }) as any,
    );

    renderPage();

    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    await user.click(editButtons[0]);

    const degreeInput = screen.getByDisplayValue("BSc Computer Science");
    await user.clear(degreeInput);
    await user.type(degreeInput, "BSc Engineering");

    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        id: "1",
        data: expect.objectContaining({ degree: "BSc Engineering" }),
      });
    });
  });

  it("shows delete confirmation and calls deleteMutation on confirm", async () => {
    const user = userEvent.setup();
    mockDelete.mockResolvedValue(undefined);
    mockUseEducation.mockReturnValue(
      createMockUseEducation({ isLoading: false, data: sampleEntries, isError: false }) as any,
    );

    renderPage();

    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    await user.click(deleteButtons[0]);

    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith("1");
    });
  });
});
