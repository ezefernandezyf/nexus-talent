import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AnalysisFeature } from "./AnalysisFeature";
import { createAnalysisResult } from "@/test/factories/analysis";

const submitAnalysis = vi.fn();

vi.mock("./hooks/useJobAnalysis", () => ({
  useJobAnalysis: vi.fn(),
}));

import { useJobAnalysis } from "./hooks/useJobAnalysis";

function mockAnalysisState(state = {}) {
  vi.mocked(useJobAnalysis).mockReturnValue({
    data: undefined,
    error: null,
    isError: false,
    isIdle: false,
    isPending: false,
    isSuccess: false,
    status: "idle",
    submitAnalysis,
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    submittedAt: 0,
    mutate: submitAnalysis,
    mutateAsync: vi.fn(),
    reset: vi.fn(),
    ...state,
  } as unknown as ReturnType<typeof useJobAnalysis>);
}

describe("AnalysisFeature", () => {
  it("renders the empty state when idle and no data", () => {
    mockAnalysisState({ isIdle: true });

    render(<AnalysisFeature />);

    expect(screen.getByText(/No hay análisis todavía/i)).toBeInTheDocument();
    expect(screen.getByText(/Pegá una descripción del puesto/i)).toBeInTheDocument();
  });

  it("does not render an empty panel before first analysis when not idle", () => {
    mockAnalysisState();

    render(<AnalysisFeature />);

    expect(screen.queryByText(/todavía no hay análisis/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/descripción del puesto/i)).toBeInTheDocument();
  });

  it("renders the loading state", () => {
    mockAnalysisState({ isPending: true });

    render(<AnalysisFeature />);

    expect(screen.getByRole("status", { name: /cargando análisis/i })).toBeInTheDocument();
  });

  it("renders the error state", () => {
    mockAnalysisState({
      isError: true,
      error: new Error("No se pudo completar el análisis."),
    });

    render(<AnalysisFeature />);

    expect(screen.getByText(/El análisis falló/i)).toBeInTheDocument();
    expect(screen.getAllByText(/No se pudo completar el análisis/i).length).toBeGreaterThan(0);
  });

  it("renders the analysis result when data is available", () => {
    mockAnalysisState({
      data: createAnalysisResult(),
      isSuccess: true,
    });

    render(<AnalysisFeature />);

    expect(screen.getByText("Summary")).toBeInTheDocument();
    expect(screen.getByText(/Un rol enfocado en construir experiencias de producto\./i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /abrir email/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /descargar markdown/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /descargar json/i })).toBeInTheDocument();
  });

  it("replaces stale output when a new vacancy starts loading", () => {
    const state: any = {
      data: createAnalysisResult(),
      error: null,
      isError: false,
      isIdle: false,
      isPending: false,
      isSuccess: true,
      status: "success",
      submitAnalysis,
      variables: undefined,
      context: undefined,
      failureCount: 0,
      failureReason: null,
      isPaused: false,
      submittedAt: 0,
      mutate: submitAnalysis,
      mutateAsync: vi.fn(),
      reset: vi.fn(),
    };

    vi.mocked(useJobAnalysis).mockImplementation(() => state as unknown as ReturnType<typeof useJobAnalysis>);

    const { rerender } = render(<AnalysisFeature />);
    expect(screen.getByText("Summary")).toBeInTheDocument();

    state.data = undefined;
    state.isSuccess = false;
    state.isPending = true;
    state.status = "pending";

    rerender(<AnalysisFeature />);

    expect(screen.queryByText("Summary")).not.toBeInTheDocument();
    expect(screen.getByRole("status", { name: /cargando análisis/i })).toBeInTheDocument();
  });

  it("renders the invalid AI fallback error state", () => {
    mockAnalysisState({
      isError: true,
      error: new Error("La respuesta de IA no es válida: bad payload"),
    });

    render(<AnalysisFeature />);

    expect(screen.getByText(/El análisis falló/i)).toBeInTheDocument();
    expect(screen.getAllByText(/La respuesta de IA no es válida/i).length).toBeGreaterThan(0);
  });
});
