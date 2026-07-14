import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "@/test/mocks/query-client";
import { CVPage } from "./CVPage";
import type { CVGenerateResponseDTO } from "@nexus-talent/shared";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockGenerateMutateAsync = vi.fn();

vi.mock("@/features/cv/hooks/useExperience", () => ({
  useExperience: vi.fn(),
}));

vi.mock("@/features/cv/hooks/useEducation", () => ({
  useEducation: vi.fn(),
}));

vi.mock("@/features/cv/hooks/useCVGenerate", () => ({
  useCVGenerate: vi.fn(),
}));

import { useExperience } from "@/features/cv/hooks/useExperience";
import { useEducation } from "@/features/cv/hooks/useEducation";
import { useCVGenerate } from "@/features/cv/hooks/useCVGenerate";

const mockUseExperience = vi.mocked(useExperience);
const mockUseEducation = vi.mocked(useEducation);
const mockUseCVGenerate = vi.mocked(useCVGenerate);

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const sampleResponse: CVGenerateResponseDTO = {
  sections: [
    { heading: "Professional Summary", body: "Experienced engineer.", order: 0 },
    { heading: "Skills", body: "- React\n- TypeScript", order: 1 },
  ],
  metadata: {
    generatedAt: "2026-07-13T12:00:00.000Z",
    model: "groq-llama-3.3",
    sectionCount: 2,
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockMutation(overrides: Partial<ReturnType<typeof makeMutation>> = {}) {
  return { ...makeMutation(), ...overrides };
}

function makeMutation() {
  return {
    mutateAsync: mockGenerateMutateAsync,
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
    isIdle: true,
    error: null,
    data: undefined,
    reset: vi.fn(),
  };
}

function renderPage() {
  const queryClient = createTestQueryClient();

  mockUseExperience.mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
    error: null,
  } as any);

  mockUseEducation.mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
    error: null,
  } as any);

  return render(
    <QueryClientProvider client={queryClient}>
      <CVPage />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUseCVGenerate.mockReturnValue(createMockMutation() as any);
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CVPage", () => {
  it("shows empty state with welcome message before first generation", () => {
    renderPage();

    expect(screen.getByText(/generá tu cv/i)).toBeInTheDocument();
    expect(screen.getByText(/completá los datos/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /generate cv/i })).toBeInTheDocument();
  });

  it("shows loading state on the button during generation", () => {
    mockUseCVGenerate.mockReturnValue(
      createMockMutation({ isPending: true }) as any,
    );

    renderPage();

    expect(screen.getByRole("button", { name: /generating/i })).toBeInTheDocument();
  });

  it("renders section order editor with default sections", () => {
    renderPage();

    expect(screen.getByText("Resumen Profesional")).toBeInTheDocument();
    expect(screen.getByText("Experiencia Laboral")).toBeInTheDocument();
    expect(screen.getByText("Educacion")).toBeInTheDocument();
    expect(screen.getByText("Habilidades")).toBeInTheDocument();
    expect(screen.getByText("Proyectos")).toBeInTheDocument();
  });

  it("renders AdHocItemForm for adding transient items", () => {
    renderPage();

    expect(screen.getByText(/add item/i)).toBeInTheDocument();
  });

  it("has job description textarea", () => {
    renderPage();

    const textarea = screen.getByPlaceholderText(/descripción del puesto/i);
    expect(textarea).toBeInTheDocument();
  });

  it("has tone selector", () => {
    renderPage();

    expect(screen.getByLabelText(/tone/i)).toBeInTheDocument();
  });

  it("shows CVPreview and export buttons after successful generation", async () => {
    mockUseCVGenerate.mockReturnValue(
      createMockMutation({
        isSuccess: true,
        data: sampleResponse,
      }) as any,
    );

    renderPage();

    await waitFor(() => {
      // CVPreview should show sections
      expect(screen.getByText("Professional Summary")).toBeInTheDocument();
      expect(screen.getByText("Skills")).toBeInTheDocument();
    });

    // Export buttons should be visible
    expect(screen.getByRole("button", { name: /download.*\.md/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /download.*\.html/i })).toBeInTheDocument();
  });

  it("generates CV when clicking Generate CV button", async () => {
    const user = userEvent.setup();
    mockGenerateMutateAsync.mockResolvedValue(sampleResponse);
    renderPage();

    const generateBtn = screen.getByRole("button", { name: /generate cv/i });
    await user.click(generateBtn);

    await waitFor(() => {
      expect(mockGenerateMutateAsync).toHaveBeenCalledTimes(1);
      expect(mockGenerateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sectionOrder: expect.any(Array),
          tone: expect.any(String),
        }),
      );
    });
  });

  it("shows error message when generation fails with 502", () => {
    mockUseCVGenerate.mockReturnValue(
      createMockMutation({
        isError: true,
        error: new Error("AI response validation failed"),
      }) as any,
    );

    renderPage();

    expect(screen.getByText(/502/i)).toBeInTheDocument();
    expect(screen.getByText(/validation failed/i)).toBeInTheDocument();
  });

  it("passes job description to generate call when provided", async () => {
    const user = userEvent.setup();
    mockGenerateMutateAsync.mockResolvedValue(sampleResponse);
    renderPage();

    const textarea = screen.getByPlaceholderText(/descripción del puesto/i);
    await user.type(textarea, "Senior frontend engineer role");

    const generateBtn = screen.getByRole("button", { name: /generate cv/i });
    await user.click(generateBtn);

    await waitFor(() => {
      expect(mockGenerateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          jobDescription: "Senior frontend engineer role",
        }),
      );
    });
  });
});
