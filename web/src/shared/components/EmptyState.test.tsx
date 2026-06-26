import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders the message and cta link", () => {
    render(
      <MemoryRouter>
        <EmptyState ctaHref="/app/analysis" ctaLabel="Ir al análisis" description="Sin contenido" title="Vacío" />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /vacío/i })).toBeInTheDocument();
    expect(screen.getByText(/sin contenido/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ir al análisis/i })).toHaveAttribute("href", "/app/analysis");
  });
});
