import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AnalysisPage } from "./AnalysisPage";
import { createTestQueryClient } from "../test/mocks/query-client";

vi.mock("../features/analysis/hooks/useAnalysisById", () => ({
  useAnalysisById: vi.fn(() => ({
    analysis: null,
    data: null,
    error: null,
    isError: false,
    isPending: false,
    isSuccess: false,
  })),
}));

vi.mock("../features/analysis/hooks/useAnalysisRepository", () => ({
  useAnalysisRepository: vi.fn(() => ({ repository: undefined, scope: "anonymous" })),
}));

describe("AnalysisPage", () => {
  it("renders the analysis shell and supporting cards", () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AnalysisPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByRole("heading", { name: /nuevo análisis de reclutamiento/i })).toBeInTheDocument();
    expect(screen.getByText(/keywords/i)).toBeInTheDocument();
    expect(screen.getByText(/drafting/i)).toBeInTheDocument();
    expect(screen.getByText(/gap analysis/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /analizar con ia/i })).toBeInTheDocument();
    expect(screen.queryByText(/todavía no hay análisis/i)).not.toBeInTheDocument();
  });

  it("prefills the analysis form from rework state", () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[{
          pathname: "/app/analysis",
          state: {
            githubRepositoryUrl: "https://github.com/acme/design-system",
            jobDescription: "Vacante rearmada desde historial",
            sourceHistoryId: "550e8400-e29b-41d4-a716-446655440000",
          },
        }] as never}>
          <AnalysisPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByLabelText(/descripción del puesto/i)).toHaveValue("Vacante rearmada desde historial");
    expect(screen.getByLabelText(/url de github/i)).toHaveValue("https://github.com/acme/design-system");
  });
});