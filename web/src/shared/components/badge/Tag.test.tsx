import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tag } from "./Tag";

describe("Tag", () => {
  it("renders children text", () => {
    render(<Tag>React</Tag>);
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("renders all variants", () => {
    const variants = ["info", "success", "warning", "error", "brand", "neutral"] as const;
    for (const variant of variants) {
      const { unmount } = render(<Tag variant={variant}>{variant}</Tag>);
      expect(screen.getByText(variant)).toBeInTheDocument();
      unmount();
    }
  });

  it("renders with onRemove button when provided", () => {
    const onRemove = vi.fn();
    render(<Tag onRemove={onRemove}>Dismissible</Tag>);

    const removeBtn = screen.getByRole("button");
    expect(removeBtn).toBeInTheDocument();
    expect(removeBtn).toHaveAttribute("aria-label", "Remove");
  });

  it("calls onRemove when clicked", async () => {
    const onRemove = vi.fn();
    const user = userEvent.setup();
    render(<Tag onRemove={onRemove}>Dismissible</Tag>);

    await user.click(screen.getByRole("button"));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("applies custom className", () => {
    render(<Tag className="custom-class">Styled</Tag>);
    expect(screen.getByText("Styled")).toHaveClass("custom-class");
  });
});
