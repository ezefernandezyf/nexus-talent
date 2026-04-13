import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AnalysisFeature } from "./AnalysisFeature";
import { createAnalysisResult } from "../../test/factories/analysis";

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
  it("does not render an empty panel before first analysis", () => {
    mockAnalysisState();

    render(<AnalysisFeature />);

    expect(screen.queryByText(/todavía no hay análisis/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/descripción del puesto/i)).toBeInTheDocument();
  });

  it("renders the loading state", () => {
    mockAnalysisState({ isPending: true });

    render(<AnalysisFeature />);

    expect(screen.getByText(/procesando/i)).toBeInTheDocument();
  });

  it("renders the error state", () => {
    mockAnalysisState({
      isError: true,
      error: new Error("No se pudo completar el análisis."),
    });

    render(<AnalysisFeature />);

    expect(screen.getByText(/El análisis falló/i)).toBeInTheDocument();
    expect(screen.getAllByText(/No se pudo completar el análisis/i)).toHaveLength(2);
  });

  it("renders the analysis result when data is available", () => {
    mockAnalysisState({
      data: createAnalysisResult({
        githubEnrichment: {
          repositoryName: "ezefernandezyf/nexus-talent",
          repositoryUrl: "https://github.com/ezefernandezyf/nexus-talent",
          detectedStack: [{ name: "TypeScript", source: "languages" }],
        },
      }),
      isSuccess: true,
    });

    render(<AnalysisFeature />);

    expect(screen.getByText(/análisis estructurado de la vacante/i)).toBeInTheDocument();
    expect(screen.getByText(/Un rol enfocado en construir experiencias de producto\./i)).toBeInTheDocument();
    expect(screen.getByText(/GitHub enriquecido/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /abrir email/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /descargar markdown/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /descargar json/i })).toBeInTheDocument();
  });
});
