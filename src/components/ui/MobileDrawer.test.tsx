import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MobileDrawer } from "./MobileDrawer";

describe("MobileDrawer", () => {
  it("renders user-facing labels without developer wording", () => {
    render(
      <MemoryRouter>
        <MobileDrawer heading="Nexus Talent" isOpen items={[{ label: "Inicio", to: "/" }]} onClose={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("dialog", { name: "Nexus Talent" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Inicio" })).toHaveAttribute("href", "/");
    expect(screen.queryByText(/mobile drawer/i)).not.toBeInTheDocument();
  });
});