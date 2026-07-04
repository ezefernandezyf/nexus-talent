import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./Button";

describe("Button snapshot", () => {
  it("renders all variants in dark mode", () => {
    document.documentElement.setAttribute("data-theme", "dark");

    const { container } = render(
      <div>
        <Button variant="filled">Filled</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="filled">Small</Button>
        <Button variant="filled" size="lg">Large</Button>
        <Button variant="filled" disabled>Disabled</Button>
      </div>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
