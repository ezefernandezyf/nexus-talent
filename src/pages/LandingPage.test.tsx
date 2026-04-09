import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LandingPage } from "./LandingPage";

describe("LandingPage", () => {
  it("renders the stitched landing composition", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /de job description a postulación ganadora en segundos\./i })).toBeInTheDocument();
    expect(screen.getByText("Eficiencia Radical")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ingresar con github/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ver demo/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /arquitectura de decisión\./i })).toBeInTheDocument();
    expect(screen.getByText("SKILLS_MATRIX_V4")).toBeInTheDocument();
    expect(screen.getByText("OUTREACH_GEN")).toBeInTheDocument();
    expect(screen.getByText("4.2s")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /menos aplicaciones, más entrevistas\./i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /empieza ahora gratis/i })).toBeInTheDocument();
    expect(screen.getByText("Nexus talent")).toBeInTheDocument();
    expect(screen.getByText(/© 2026\s+nexus talent\. built for the machine era\./i)).toBeInTheDocument();
  });
});
