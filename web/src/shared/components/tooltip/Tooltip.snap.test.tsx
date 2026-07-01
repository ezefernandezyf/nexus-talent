import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tooltip } from "./Tooltip";
import { Popover } from "./Popover";

describe("Tooltip snapshots", () => {
  it("renders tooltip trigger in dark mode", () => {
    document.documentElement.setAttribute("data-theme", "dark");

    const { container } = render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});

describe("Popover snapshots", () => {
  it("renders popover trigger in dark mode", () => {
    document.documentElement.setAttribute("data-theme", "dark");

    const { container } = render(
      <Popover content={<p>Popover content</p>}>
        <button>Click me</button>
      </Popover>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
