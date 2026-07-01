import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { ToggleGroup } from "./ToggleGroup";

function ToggleGroupExample() {
  const [selected, setSelected] = useState<string[]>(["react"]);
  return (
    <ToggleGroup value={selected} onChange={setSelected}>
      <ToggleGroup.Item value="react">React</ToggleGroup.Item>
      <ToggleGroup.Item value="vue">Vue</ToggleGroup.Item>
      <ToggleGroup.Item value="svelte">Svelte</ToggleGroup.Item>
    </ToggleGroup>
  );
}

describe("ToggleGroup", () => {
  it("renders all options", () => {
    render(<ToggleGroupExample />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Vue")).toBeInTheDocument();
    expect(screen.getByText("Svelte")).toBeInTheDocument();
  });

  it("marks initially selected items", () => {
    render(<ToggleGroupExample />);
    expect(screen.getByText("React")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Vue")).toHaveAttribute("aria-pressed", "false");
  });

  it("toggles selection on click", async () => {
    const user = userEvent.setup();
    render(<ToggleGroupExample />);

    await user.click(screen.getByText("Vue"));
    expect(screen.getByText("Vue")).toHaveAttribute("aria-pressed", "true");
  });
});
