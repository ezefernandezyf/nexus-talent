import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AnalysisPage } from "./AnalysisPage";
import { createTestQueryClient } from "../test/mocks/query-client";

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
});