import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HistoryPage } from "./HistoryPage";
import { createTestQueryClient } from "../test/mocks/query-client";

vi.mock("../features/analysis/hooks/useAnalysisRepository", () => ({
  useAnalysisRepository: vi.fn(() => ({ repository: undefined, scope: "anonymous" })),
}));

describe("HistoryPage", () => {
  it("renders the history shell and export action", () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HistoryPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByRole("heading", { name: /historial de análisis/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /exportar datos/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /nuevo análisis/i })).toBeInTheDocument();
  });
});