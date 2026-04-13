import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createAnalysisResult } from "../../../test/factories/analysis";
import { AnalysisCard } from "./AnalysisCard";

describe("AnalysisCard", () => {
  it("renders the analysis summary and outreach editor", () => {
    render(<AnalysisCard result={createAnalysisResult()} />);

    expect(screen.getByRole("heading", { name: /análisis estructurado de la vacante/i })).toBeInTheDocument();
    expect(screen.getByText(/un rol enfocado en construir experiencias de producto/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copiar mensaje/i })).toBeInTheDocument();
  });
});
