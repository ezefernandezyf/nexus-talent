import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotFoundPage from "./NotFoundPage";

describe("NotFoundPage", () => {
  it("renders the 404 content and return links", () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /^404$/i })).toBeInTheDocument();
    expect(screen.getByText(/la ruta no existe o fue movida/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /volver al inicio/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /ver privacidad/i })).toHaveAttribute("href", "/privacy");
  });
});