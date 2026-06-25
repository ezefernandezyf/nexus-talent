import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PrivacyPage from "./PrivacyPage";

describe("PrivacyPage", () => {
  it("renders the privacy content and navigation links", () => {
    render(
      <MemoryRouter>
        <PrivacyPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /privacidad y manejo de datos/i })).toBeInTheDocument();
    expect(screen.getByText(/nexus talent guarda únicamente la información necesaria/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /volver al inicio/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /ir al análisis/i })).toHaveAttribute("href", "/app/analysis");
  });
});