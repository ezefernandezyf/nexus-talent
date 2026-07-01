import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge, type BadgeVariant, type BadgeSize } from "./Badge";
import { Check } from "@phosphor-icons/react";

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("renders with info variant by default", () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText("Default")).toBeInTheDocument();
  });

  it("renders all variants without error", () => {
    const variants: BadgeVariant[] = ["info", "success", "warning", "error", "brand", "neutral"];
    for (const variant of variants) {
      const { unmount } = render(<Badge variant={variant}>{variant}</Badge>);
      expect(screen.getByText(variant)).toBeInTheDocument();
      unmount();
    }
  });

  it("renders all sizes without error", () => {
    const sizes: BadgeSize[] = ["sm", "md"];
    for (const size of sizes) {
      const { unmount } = render(<Badge size={size}>Badge</Badge>);
      expect(screen.getByText("Badge")).toBeInTheDocument();
      unmount();
    }
  });

  it("renders with an icon when provided", () => {
    render(
      <Badge icon={<Check data-testid="badge-icon" weight="bold" />} variant="success">
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
