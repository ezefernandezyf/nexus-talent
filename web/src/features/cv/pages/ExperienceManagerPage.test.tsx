import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "@/test/mocks/query-client";
import { ExperienceManagerPage } from "./ExperienceManagerPage";
import type { WorkExperienceDTO } from "@nexus-talent/shared";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

function createMockUseExperience(overrides: Partial<ReturnType<typeof makeMock>> = {}) {
  const defaults = makeMock();
  return { ...defaults, ...overrides };
}

function makeMock() {
  return {
    data: undefined as WorkExperienceDTO[] | undefined,
    isLoading: true,
    isError: false,
    error: null,
    createMutation: { mutateAsync: mockCreate, isPending: false },
    updateMutation: { mutateAsync: mockUpdate, isPending: false },
    deleteMutation: { mutateAsync: mockDelete, isPending: false },
  };
}

vi.mock("@/features/cv/hooks/useExperience", () => ({
  useExperience: vi.fn(),
}));

import { useExperience } from "@/features/cv/hooks/useExperience";
const mockUseExperience = vi.mocked(useExperience);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderPage() {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ExperienceManagerPage />
    </QueryClientProvider>,
  );
}

const sampleEntries: WorkExperienceDTO[] = [
  {
    id: "1",
    userId: "u1",
    company: "Acme Corp",
    role: "Senior Developer",
    startDate: "2023-01-01",
    endDate: null,
    description: "Built cool stuff",
    location: "Remote",
  },
  {
    id: "2",
    userId: "u1",
    company: "Startup Inc",
    role: "Junior Developer",
    startDate: "2021-06-01",
    endDate: "2022-12-31",
    description: null,
    location: null,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ExperienceManagerPage", () => {
  it("shows loading state when data is being fetched", () => {
    mockUseExperience.mockReturnValue(createMockUseExperience({ isLoading: true, data: undefined }) as any);

    renderPage();

    expect(screen.getByTestId("experience-skeleton")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("shows empty state when no experience entries exist", () => {
    mockUseExperience.mockReturnValue(
      createMockUseExperience({ isLoading: false, data: [], isError: false }) as any,
    );

    renderPage();

    expect(screen.getByText(/no hay experiencia/i)).toBeInTheDocument();
  });

  it("shows error state when query fails", () => {
    mockUseExperience.mockReturnValue(
      createMockUseExperience({
        isLoading: false,
        data: undefined,
        isError: true,
        error: new Error("Failed to fetch"),
      }) as any,
    );

    renderPage();

    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it("renders list of experience entries", async () => {
    mockUseExperience.mockReturnValue(
      createMockUseExperience({ isLoading: false, data: sampleEntries, isError: false }) as any,
    );

    renderPage();

    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Senior Developer")).toBeInTheDocument();
    expect(screen.getByText("Startup Inc")).toBeInTheDocument();
    expect(screen.getByText("Junior Developer")).toBeInTheDocument();
  });

  it("shows add form when clicking 'Add Experience' button", async () => {
    const user = userEvent.setup();
    mockUseExperience.mockReturnValue(
      createMockUseExperience({ isLoading: false, data: [], isError: false }) as any,
    );

    renderPage();

    const addButton = screen.getByRole("button", { name: /add experience/i });
    await user.click(addButton);

    expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
  });

  it("calls createMutation when add form is submitted", async () => {
    const user = userEvent.setup();
    mockCreate.mockResolvedValue({ id: "new-1", userId: "u1", company: "NewCo", role: "Dev", startDate: "2024-01-01" });
    mockUseExperience.mockReturnValue(
      createMockUseExperience({ isLoading: false, data: [], isError: false }) as any,
    );

    renderPage();

    // Open add form
    await user.click(screen.getByRole("button", { name: /add experience/i }));
    // Fill and submit
    await user.type(screen.getByLabelText(/company/i), "NewCo");
    await user.type(screen.getByLabelText(/role/i), "Dev");
    await user.type(screen.getByLabelText(/start date/i), "2024-01-01");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        company: "NewCo",
        role: "Dev",
        startDate: "2024-01-01",
        endDate: null,
        description: null,
        location: null,
      });
    });
  });

  it("shows edit form when clicking edit button on an entry", async () => {
    const user = userEvent.setup();
    mockUseExperience.mockReturnValue(
      createMockUseExperience({ isLoading: false, data: sampleEntries, isError: false }) as any,
    );

    renderPage();

    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    await user.click(editButtons[0]);

    expect(screen.getByDisplayValue("Acme Corp")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Senior Developer")).toBeInTheDocument();
  });

  it("calls updateMutation when edit form is submitted", async () => {
    const user = userEvent.setup();
    mockUpdate.mockResolvedValue({ ...sampleEntries[0], role: "Lead Developer" });
    mockUseExperience.mockReturnValue(
      createMockUseExperience({ isLoading: false, data: sampleEntries, isError: false }) as any,
    );

    renderPage();

    // Open edit
    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    await user.click(editButtons[0]);

    // Modify role
    const roleInput = screen.getByDisplayValue("Senior Developer");
    await user.clear(roleInput);
    await user.type(roleInput, "Lead Developer");

    // Submit
    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        id: "1",
        data: expect.objectContaining({ role: "Lead Developer" }),
      });
    });
  });

  it("shows delete confirmation and calls deleteMutation on confirm", async () => {
    const user = userEvent.setup();
    mockDelete.mockResolvedValue(undefined);
    mockUseExperience.mockReturnValue(
      createMockUseExperience({ isLoading: false, data: sampleEntries, isError: false }) as any,
    );

    renderPage();

    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    await user.click(deleteButtons[0]);

    // Confirmation should appear
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();

    // Confirm
    await user.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith("1");
    });
  });
});
