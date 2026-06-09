import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FeatureSection } from "./FeatureSection";

describe("FeatureSection", () => {
  it("scopes the decision column sticky behavior to desktop breakpoints", () => {
    render(<FeatureSection />);

    const heading = screen.getByRole("heading", { name: /arquitectura de decisión\./i });
    const decisionColumn = heading.closest("div");

    expect(decisionColumn).toHaveClass("md:sticky");
    expect(decisionColumn).not.toHaveClass("sticky");
  });
});