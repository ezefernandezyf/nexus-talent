import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LandingPage } from "./LandingPage";

describe("LandingPage", () => {
  it("renders the homepage hero and primary calls to action", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /convertí una job description/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /probar análisis/i })).toHaveAttribute("href", "/app/analysis");
    expect(screen.getByRole("link", { name: /crear cuenta/i })).toHaveAttribute("href", "/auth/sign-up");
  });
});
