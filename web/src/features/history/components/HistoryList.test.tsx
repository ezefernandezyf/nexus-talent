import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { createSavedAnalysis } from "../../../test/factories/analysis";
import { HistoryList } from "./HistoryList";

describe("HistoryList", () => {
  it("renders items and pagination controls", () => {
    const onDelete = vi.fn();
    const onPageChange = vi.fn();

    render(
      <MemoryRouter>
        <HistoryList
          analyses={[createSavedAnalysis()]}
          currentPage={1}
          isDeletingId={null}
          onDelete={onDelete}
          onPageChange={onPageChange}
          totalPages={1}
        />
      </MemoryRouter>,
    );

    const list = screen.getByRole("list", { name: /historial de análisis/i });
    expect(within(list).getByRole("listitem")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /eliminar/i })).toBeInTheDocument();
    expect(screen.getByText(/página 1 de 1/i)).toBeInTheDocument();
    expect(screen.getByText(/mostrando 1 ejecuciones en esta página/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /página anterior/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /página siguiente/i })).toBeDisabled();
  });

  it("calls the page change handler when the pagination controls are used", async () => {
    const onDelete = vi.fn();
    const onPageChange = vi.fn();

    render(
      <MemoryRouter>
        <HistoryList
          analyses={[createSavedAnalysis()]}
          currentPage={2}
          isDeletingId={null}
          onDelete={onDelete}
          onPageChange={onPageChange}
          totalPages={3}
        />
      </MemoryRouter>,
    );

    screen.getByRole("button", { name: /página anterior/i }).click();
    screen.getByRole("button", { name: /página siguiente/i }).click();

    expect(onPageChange).toHaveBeenCalledWith(1);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
