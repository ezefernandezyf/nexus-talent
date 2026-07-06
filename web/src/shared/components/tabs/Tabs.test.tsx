import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { Tabs } from "./Tabs";

function TabsExample() {
  const [tab, setTab] = useState("tab1");
  return (
    <Tabs value={tab} onChange={setTab}>
      <Tabs.List>
        <Tabs.Tab value="tab1">First</Tabs.Tab>
        <Tabs.Tab value="tab2">Second</Tabs.Tab>
        <Tabs.Tab value="tab3">Third</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="tab1">Panel 1</Tabs.Panel>
      <Tabs.Panel value="tab2">Panel 2</Tabs.Panel>
      <Tabs.Panel value="tab3">Panel 3</Tabs.Panel>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("renders all tab labels", () => {
    render(<TabsExample />);
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
    expect(screen.getByText("Third")).toBeInTheDocument();
  });

  it("shows the initially active panel", () => {
    render(<TabsExample />);
    expect(screen.getByText("Panel 1")).toBeInTheDocument();
  });

  it("hides non-active panels", () => {
    render(<TabsExample />);
    expect(screen.queryByText("Panel 2")).not.toBeInTheDocument();
    expect(screen.queryByText("Panel 3")).not.toBeInTheDocument();
  });

  it("switches panel when a tab is clicked", async () => {
    const user = userEvent.setup();
    render(<TabsExample />);

    await user.click(screen.getByText("Second"));
    expect(screen.getByText("Panel 2")).toBeInTheDocument();
    expect(screen.queryByText("Panel 1")).not.toBeInTheDocument();
  });

  it("marks the active tab with aria-selected", async () => {
    const user = userEvent.setup();
    render(<TabsExample />);

    expect(screen.getByText("First")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Second")).toHaveAttribute("aria-selected", "false");

    await user.click(screen.getByText("Second"));
    expect(screen.getByText("First")).toHaveAttribute("aria-selected", "false");
    expect(screen.getByText("Second")).toHaveAttribute("aria-selected", "true");
  });
});
