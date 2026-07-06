import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Label } from "./Label";

describe("Label", () => {
  it("renders children text", () => {
    render(<Label>Email</Label>);
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("associates with input via htmlFor", () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" />
      </>,
    );
    expect(screen.getByLabelText("Email")).toHaveAttribute("id", "email");
  });

  it("applies custom className", () => {
    render(<Label className="custom-class">Label</Label>);
    expect(screen.getByText("Label")).toHaveClass("custom-class");
  });
});
