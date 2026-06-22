import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge variant="info">New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("renders with info variant by default", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge).toBeInTheDocument();
    expect(badge.tagName).toBe("SPAN");
  });

  it("renders all variants without error", () => {
    const variants = ["info", "success", "warning", "error"] as const;
    for (const variant of variants) {
      const { unmount } = render(<Badge variant={variant}>{variant}</Badge>);
      expect(screen.getByText(variant)).toBeInTheDocument();
      unmount();
    }
  });

  it("renders all sizes without error", () => {
    const sizes = ["sm", "md"] as const;
    for (const size of sizes) {
      const { unmount } = render(<Badge size={size}>Badge</Badge>);
      expect(screen.getByText("Badge")).toBeInTheDocument();
      unmount();
    }
  });

  it("renders with an icon when provided", () => {
    render(
      <Badge icon={<span data-testid="badge-icon">🔔</span>} variant="info">
        With Icon
      </Badge>,
    );
    expect(screen.getByText("With Icon")).toBeInTheDocument();
    expect(screen.getByTestId("badge-icon")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Badge className="custom-class">Styled</Badge>);
    expect(screen.getByText("Styled")).toHaveClass("custom-class");
  });
});
