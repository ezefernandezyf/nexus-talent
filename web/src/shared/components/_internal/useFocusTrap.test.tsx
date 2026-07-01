import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";
import { describe, expect, it } from "vitest";
import { useFocusTrap } from "./useFocusTrap";

function TrapTest({ isActive }: { isActive: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, isActive);
  return (
    <div>
      <div ref={ref} data-testid="trap-container">
        <button data-testid="first-btn">First</button>
        <button data-testid="second-btn">Second</button>
        <button data-testid="third-btn">Third</button>
      </div>
      <a href="#" data-testid="outside-link">Outside</a>
    </div>
  );
}

describe("useFocusTrap", () => {
  it("focuses the first focusable element when activated", () => {
    render(<TrapTest isActive={true} />);
    expect(screen.getByTestId("first-btn")).toHaveFocus();
  });

  it("does not trap focus when inactive", () => {
    render(<TrapTest isActive={false} />);
    expect(screen.getByTestId("first-btn")).not.toHaveFocus();
  });

  it("cycles forward with Tab key", async () => {
    const user = userEvent.setup();
    render(<TrapTest isActive={true} />);

    await user.tab();
    expect(screen.getByTestId("second-btn")).toHaveFocus();

    await user.tab();
    expect(screen.getByTestId("third-btn")).toHaveFocus();
  });

  it("wraps from last back to first on Tab", async () => {
    const user = userEvent.setup();
    render(<TrapTest isActive={true} />);

    // Tab to second
    await user.tab();
    // Tab to third
    await user.tab();
    // Tab should wrap back to first
    await user.tab();
    expect(screen.getByTestId("first-btn")).toHaveFocus();
  });

  it("wraps from first to last on Shift+Tab", async () => {
    const user = userEvent.setup();
    render(<TrapTest isActive={true} />);

    // First button already focused, Shift+Tab should go to last
    await user.tab({ shift: true });
    expect(screen.getByTestId("third-btn")).toHaveFocus();
  });
});
