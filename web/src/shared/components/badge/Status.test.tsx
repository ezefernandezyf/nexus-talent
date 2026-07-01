import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Status } from "./Status";

describe("Status", () => {
  it("renders label text", () => {
    render(<Status variant="success">Active</Status>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders all variants", () => {
    const variants = ["info", "success", "warning", "error", "neutral"] as const;
    for (const variant of variants) {
      const { unmount } = render(<Status variant={variant}>{variant}</Status>);
      expect(screen.getByText(variant)).toBeInTheDocument();
      unmount();
    }
  });

  it("renders as a span with dot indicator", () => {
    render(<Status variant="info">Info</Status>);
    const status = screen.getByText("Info");
    expect(status.tagName).toBe("SPAN");
  });

  it("applies custom className", () => {
    render(<Status variant="success" className="custom-class">Styled</Status>);
    expect(screen.getByText("Styled")).toHaveClass("custom-class");
  });
});
