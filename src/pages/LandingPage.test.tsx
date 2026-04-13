import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LandingPage } from "./LandingPage";

describe("LandingPage", () => {
  it("renders the stitched landing composition and mobile navigation", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /de job description a postulación ganadora en segundos\./i })).toBeInTheDocument();
    expect(screen.getByText("Eficiencia Radical")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ingresar con github/i })).toHaveAttribute("href", "/auth/sign-in");
    expect(screen.getByRole("button", { name: /ver demo/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /arquitectura de decisión\./i })).toBeInTheDocument();
    expect(screen.getByText("SKILLS_MATRIX_V4")).toBeInTheDocument();
    expect(screen.getByText("OUTREACH_GEN")).toBeInTheDocument();
    expect(screen.getByText("4.2s")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /menos aplicaciones, más entrevistas\./i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /empieza ahora gratis/i })).toHaveAttribute("href", "/auth/sign-up");
    expect(screen.getByRole("button", { name: /abrir menú/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ingresar/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /crear cuenta/i })).toBeInTheDocument();
    expect(screen.getByText("© 2026 Nexus talent. Built for the machine era.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /abrir menú/i }));
    const drawer = screen.getByRole("dialog", { name: "Nexus Talent" });
    expect(within(drawer).getAllByRole("link", { name: "Ingresar" }).map((element) => element.getAttribute("href"))).toContain("/auth/sign-in");
    expect(within(drawer).getAllByRole("link", { name: "Crear cuenta" }).map((element) => element.getAttribute("href"))).toContain("/auth/sign-up");
  });
});
