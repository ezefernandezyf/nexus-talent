import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Popover } from "./Popover";

describe("Popover", () => {
  it("renders the trigger element", () => {
    render(
      <Popover content={<p>Popover content</p>}>
        <button>Open</button>
      </Popover>,
    );

    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("opens on trigger click", async () => {
    const user = userEvent.setup();
    render(
      <Popover content={<p>Popover content</p>}>
        <button>Open</button>
      </Popover>,
    );

    await user.click(screen.getByText("Open"));
    expect(screen.getByText("Popover content")).toBeInTheDocument();
  });

  it("closes on Escape key", async () => {
    const user = userEvent.setup();
    render(
      <Popover content={<p>Popover content</p>}>
        <button>Open</button>
      </Popover>,
    );

    await user.click(screen.getByText("Open"));
    await user.keyboard("{Escape}");
    // Wait for exit animation to complete
    await new Promise((r) => setTimeout(r, 400));
    expect(screen.queryByText("Popover content")).not.toBeInTheDocument();
  });
});
