import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("renders the heading, description and action content", () => {
    render(<PageHeader action={<button type="button">Exportar datos</button>} description="Registro completo" title="Historial de Análisis" />);

    expect(screen.getByRole("heading", { name: /historial de análisis/i })).toBeInTheDocument();
    expect(screen.getByText(/registro completo/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /exportar datos/i })).toBeInTheDocument();
  });
});
