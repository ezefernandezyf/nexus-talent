import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hero } from "./Hero";

describe("Hero", () => {
  it("renders the title, description and call to action buttons", () => {
    render(
      <Hero
        ctas={[{ label: "Crear cuenta" }, { label: "Ingresar" }]}
        description="Descripción de prueba"
        subtitle="Eficiencia Radical"
        title="De Job Description a Postulación Ganadora en Segundos."
      />,
    );

    expect(screen.getByRole("heading", { name: /de job description a postulación ganadora en segundos\./i })).toBeInTheDocument();
    expect(screen.getByText(/descripción de prueba/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crear cuenta/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ingresar/i })).toBeInTheDocument();
  });
});
