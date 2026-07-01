import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Drawer } from "./Drawer";

describe("Drawer", () => {
  it("renders when open is true", () => {
    render(
      <Drawer open={true} onClose={vi.fn()} title="Test Drawer">
        <p>Drawer content</p>
      </Drawer>,
    );

    expect(screen.getByText("Test Drawer")).toBeInTheDocument();
    expect(screen.getByText("Drawer content")).toBeInTheDocument();
  });

  it("does not render when open is false", () => {
    render(
      <Drawer open={false} onClose={vi.fn()} title="Test Drawer">
        <p>Content</p>
      </Drawer>,
    );

    expect(screen.queryByText("Test Drawer")).not.toBeInTheDocument();
  });

  it("calls onClose when Escape is pressed", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Drawer open={true} onClose={onClose} title="Test Drawer">
        <p>Content</p>
      </Drawer>,
    );

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Drawer open={true} onClose={onClose} title="Test Drawer">
        <p>Content</p>
      </Drawer>,
    );

    const backdrop = screen.getByTestId("drawer-backdrop");
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("locks body scroll when open", () => {
    render(
      <Drawer open={true} onClose={vi.fn()} title="Test">
        <p>Content</p>
      </Drawer>,
    );

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("renders with custom width class", () => {
    render(
      <Drawer open={true} onClose={vi.fn()} title="Test" className="w-96">
        <p>Content</p>
      </Drawer>,
    );

    expect(screen.getByText("Test")).toBeInTheDocument();
  });
});
