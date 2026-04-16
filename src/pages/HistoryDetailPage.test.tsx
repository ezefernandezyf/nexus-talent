import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSavedAnalysis } from "../test/factories/analysis";
import { createTestQueryClient } from "../test/mocks/query-client";
import { HistoryDetailPage } from "./HistoryDetailPage";

function createRepository({ shouldFailUpdate = false } = {}) {
  const analyses = [
    createSavedAnalysis({
      displayName: "Frontend Lead",
      id: "550e8400-e29b-41d4-a716-446655440000",
      notes: "Prioritize product polish",
    }),
  ];

  return {
    getAll: vi.fn(async () => [...analyses]),
    getById: vi.fn(async (id: string) => analyses.find((analysis) => analysis.id === id) ?? null),
    save: vi.fn(async () => analyses[0]),
    update: vi.fn(async (id: string, patch: { displayName?: string; notes?: string }) => {
      if (shouldFailUpdate) {
        return null;
      }

      const index = analyses.findIndex((analysis) => analysis.id === id);

      if (index < 0) {
        return null;
      }

      analyses[index] = {
        ...analyses[index],
        ...(patch.displayName !== undefined ? { displayName: patch.displayName } : {}),
        ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
      };

      return analyses[index];
    }),
    delete: vi.fn(async () => undefined),
  };
}

let repository = createRepository();

vi.mock("../features/analysis/hooks/useAnalysisRepository", () => ({
  useAnalysisRepository: vi.fn(() => ({ repository, scope: "anonymous" })),
}));

function renderHistoryDetailPage(path = "/app/history/550e8400-e29b-41d4-a716-446655440000") {
  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<HistoryDetailPage />} path="/app/history/:analysisId" />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("HistoryDetailPage", () => {
  beforeEach(() => {
    repository = createRepository();
    vi.clearAllMocks();
  });

  it("renders the saved analysis and persists edits", async () => {
    const user = userEvent.setup();

    renderHistoryDetailPage();

    await waitFor(() => expect(screen.getByRole("heading", { name: /detalle del análisis/i })).toBeInTheDocument());
    expect(screen.getByRole("link", { name: /rework desde este guardado/i })).toHaveAttribute(
      "href",
      "/app/analysis?sourceHistoryId=550e8400-e29b-41d4-a716-446655440000",
    );
    await user.clear(screen.getByLabelText(/nombre visible del guardado/i));
    await user.type(screen.getByLabelText(/nombre visible del guardado/i), "Frontend Principal");
    await user.clear(screen.getByLabelText(/notas del guardado/i));
    await user.type(screen.getByLabelText(/notas del guardado/i), "Volver a revisar después del diseño.");
    await user.click(screen.getByRole("button", { name: /guardar cambios/i }));

    await waitFor(() => expect(screen.getByText(/cambios guardados correctamente/i)).toBeInTheDocument());
    expect(repository.update).toHaveBeenCalledWith(
      "550e8400-e29b-41d4-a716-446655440000",
      {
        displayName: "Frontend Principal",
        notes: "Volver a revisar después del diseño.",
      },
    );
  });

  it("shows the not-found state when the saved analysis is missing", async () => {
    renderHistoryDetailPage("/app/history/missing-id");

    await waitFor(() => expect(screen.getByRole("heading", { name: /análisis no encontrado/i })).toBeInTheDocument());
    expect(screen.getByRole("link", { name: /volver al historial/i })).toHaveAttribute("href", "/app/history");
  });

  it("keeps the draft visible when saving fails", async () => {
    const user = userEvent.setup();

    repository = createRepository({ shouldFailUpdate: true });
    renderHistoryDetailPage();

    await waitFor(() => expect(screen.getByRole("heading", { name: /detalle del análisis/i })).toBeInTheDocument());
    await user.clear(screen.getByLabelText(/nombre visible del guardado/i));
    await user.type(screen.getByLabelText(/nombre visible del guardado/i), "Frontend Principal");
    await user.click(screen.getByRole("button", { name: /guardar cambios/i }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/no encontramos ese guardado en el historial/i));
    expect(screen.getByDisplayValue("Frontend Principal")).toBeInTheDocument();
  });
});