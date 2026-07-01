import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Toast } from "./Toast";

describe("Toast", () => {
  it("renders the message text", () => {
    render(
      <Toast
        id="test-1"
        message="Operation successful"
        variant="success"
        onDismiss={vi.fn()}
      />,
    );

    expect(screen.getByText("Operation successful")).toBeInTheDocument();
  });

  it("renders all variants", () => {
    const variants = ["success", "warning", "error", "info"] as const;
    for (const variant of variants) {
      const { unmount } = render(
        <Toast id={`t-${variant}`} message={variant} variant={variant} onDismiss={vi.fn()} />,
      );
      expect(screen.getByText(variant)).toBeInTheDocument();
      unmount();
    }
  });

  it("renders a close button", () => {
    render(
      <Toast id="test-1" message="Dismiss me" variant="info" onDismiss={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
  });

  it("calls onDismiss when close button is clicked", async () => {
    const onDismiss = vi.fn();
    const user = userEvent.setup();

    render(
      <Toast id="test-1" message="Dismiss me" variant="info" onDismiss={onDismiss} />,
    );

    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledWith("test-1");
  });

  it("sets an accessible role", () => {
    render(
      <Toast id="test-1" message="Alert" variant="warning" onDismiss={vi.fn()} />,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
