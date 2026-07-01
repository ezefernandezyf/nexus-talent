import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Dropdown } from "./Dropdown";

const items = [
  { label: "Edit", onSelect: vi.fn() },
  { label: "Duplicate", onSelect: vi.fn() },
  { label: "Delete", onSelect: vi.fn() },
];

describe("Dropdown", () => {
  it("renders the trigger element", () => {
    render(
      <Dropdown trigger={<button>Open</button>} items={items} />,
    );

    expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
  });

  it("opens the menu when trigger is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown trigger={<button>Open</button>} items={items} />,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Duplicate")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("calls onSelect when an item is clicked", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <Dropdown trigger={<button>Menu</button>} items={[{ label: "Save", onSelect }]} />,
    );

    await user.click(screen.getByRole("button", { name: "Menu" }));
    await user.click(screen.getByText("Save"));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
