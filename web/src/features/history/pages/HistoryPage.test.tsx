import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { HistoryPage } from "./HistoryPage";
import { createTestQueryClient } from "@/test/mocks/query-client";
import { mockDownloadApis } from "@/test/mocks/browser";

vi.mock("../../analysis/hooks/useAnalysisRepository", () => ({
  useAnalysisRepository: vi.fn(() => ({ repository: undefined, scope: "anonymous" })),
}));

describe("HistoryPage", () => {
  beforeEach(() => {
    mockDownloadApis();
  });

  it("renders the history shell", () => {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HistoryPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByRole("heading", { name: /historial de análisis/i })).toBeInTheDocument();
  });
});
