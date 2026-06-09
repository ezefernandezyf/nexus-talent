import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { HistoryPage } from "./HistoryPage";
import { createTestQueryClient } from "../test/mocks/query-client";
import { mockDownloadApis } from "../test/mocks/browser";

vi.mock("../features/analysis/hooks/useAnalysisRepository", () => ({
  useAnalysisRepository: vi.fn(() => ({ repository: undefined, scope: "anonymous" })),
}));

describe("HistoryPage", () => {
  beforeEach(() => {
    mockDownloadApis();
  });

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

  it("downloads the current history data from the export button", async () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HistoryPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByRole("button", { name: /exportar datos/i })).toBeEnabled());
    screen.getByRole("button", { name: /exportar datos/i }).click();

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
  });
});