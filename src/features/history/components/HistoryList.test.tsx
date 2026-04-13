import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createSavedAnalysis } from "../../../test/factories/analysis";
import { HistoryList } from "./HistoryList";

describe("HistoryList", () => {
  it("renders items and pagination controls", () => {
    const onDelete = vi.fn();

    render(
      <HistoryList
        analyses={[createSavedAnalysis()]}
        isDeletingId={null}
        onDelete={onDelete}
        totalPages={1}
        visibleCount={1}
      />,
    );

    const list = screen.getByRole("list", { name: /historial de análisis/i });
    expect(within(list).getByRole("listitem")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /eliminar/i })).toBeInTheDocument();
    expect(screen.getByText(/mostrando 1 de 1 ejecuciones/i)).toBeInTheDocument();
  });
});
