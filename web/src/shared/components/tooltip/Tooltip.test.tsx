import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tooltip } from "./Tooltip";

describe("Tooltip", () => {
  it("renders the trigger element", () => {
    render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>,
    );

    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("shows tooltip content on hover", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>,
    );

    await user.hover(screen.getByText("Hover me"));

    // Wait for the delay to pass
    const tooltip = await screen.findByText("Tooltip content", {}, { timeout: 500 });
    expect(tooltip).toBeInTheDocument();
  });

  it("hides tooltip content on unhover", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>,
    );

    await user.hover(screen.getByText("Hover me"));
    await screen.findByText("Tooltip content", {}, { timeout: 500 });

    await user.unhover(screen.getByText("Hover me"));

    // Wait for close delay + exit animation to pass
    await new Promise((r) => setTimeout(r, 500));
    expect(screen.queryByText("Tooltip content")).not.toBeInTheDocument();
  });
});
