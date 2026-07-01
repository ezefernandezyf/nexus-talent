import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Dropdown } from "./Dropdown";
import { Select } from "./Select";

describe("Dropdown snapshots", () => {
  it("renders dropdown in dark mode", () => {
    document.documentElement.setAttribute("data-theme", "dark");

    const { container } = render(
      <Dropdown
        trigger={<button>Menu</button>}
        items={[
          { label: "Edit", onSelect: vi.fn() },
          { label: "Delete", onSelect: vi.fn(), disabled: true },
        ]}
      />,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});

describe("Select snapshots", () => {
  it("renders select in dark mode", () => {
    document.documentElement.setAttribute("data-theme", "dark");

    const { container } = render(
      <Select
        options={[
          { value: "1", label: "Option 1" },
          { value: "2", label: "Option 2" },
          { value: "3", label: "Option 3", disabled: true },
        ]}
        placeholder="Choose..."
      />,
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders select with a value selected", () => {
    document.documentElement.setAttribute("data-theme", "dark");

    const { container } = render(
      <Select
        options={[
          { value: "1", label: "Option 1" },
          { value: "2", label: "Option 2" },
        ]}
        value="2"
      />,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
