import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input } from "./Input";

describe("Input snapshot", () => {
  it("renders all states in dark mode", () => {
    document.documentElement.setAttribute("data-theme", "dark");

    const { container } = render(
      <div>
        <Input label="Default" placeholder="Type here..." />
        <Input label="With Error" error="Something went wrong" />
        <Input label="Disabled" disabled value="Can't edit" />
        <Input label="Textarea" multiline placeholder="Write more..." />
      </div>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
