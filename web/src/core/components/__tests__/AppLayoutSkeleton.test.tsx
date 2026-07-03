import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AppLayoutSkeleton } from "../AppLayoutSkeleton";

describe("AppLayoutSkeleton", () => {
  it("renders skeleton elements matching AppLayout structure", () => {
    render(
      <MemoryRouter>
        <AppLayoutSkeleton />
      </MemoryRouter>,
    );

    // Should have a top-bar / header skeleton
    expect(screen.getByLabelText("Cargando aplicación")).toBeInTheDocument();
  });

  it("renders skeleton blocks for the main layout areas", () => {
    const { container } = render(
      <MemoryRouter>
        <AppLayoutSkeleton />
      </MemoryRouter>,
    );

    const skeletonDiv = container.firstChild as HTMLElement;
    expect(skeletonDiv).toBeInTheDocument();

    // Verify all three layout sections exist: header, sidebar, content
    const animatedElements = container.querySelectorAll(".animate-pulse");
    expect(animatedElements.length).toBeGreaterThanOrEqual(1);
  });
});
