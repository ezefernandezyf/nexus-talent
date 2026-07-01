import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Tabs } from "./Tabs";
import { ToggleGroup } from "./ToggleGroup";

describe("Tabs snapshots", () => {
  it("renders tabs in dark mode", () => {
    document.documentElement.setAttribute("data-theme", "dark");

    const { container } = render(
      <Tabs value="tab1" onChange={vi.fn()}>
        <Tabs.List>
          <Tabs.Tab value="tab1">Tab 1</Tabs.Tab>
          <Tabs.Tab value="tab2">Tab 2</Tabs.Tab>
          <Tabs.Tab value="tab3" disabled>Tab 3</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="tab1"><p>Content 1</p></Tabs.Panel>
        <Tabs.Panel value="tab2"><p>Content 2</p></Tabs.Panel>
        <Tabs.Panel value="tab3"><p>Content 3</p></Tabs.Panel>
      </Tabs>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});

describe("ToggleGroup snapshots", () => {
  it("renders toggle group in dark mode", () => {
    document.documentElement.setAttribute("data-theme", "dark");

    const { container } = render(
      <ToggleGroup value={["all"]} onChange={vi.fn()}>
        <ToggleGroup.Item value="all">All</ToggleGroup.Item>
        <ToggleGroup.Item value="active">Active</ToggleGroup.Item>
        <ToggleGroup.Item value="archived">Archived</ToggleGroup.Item>
      </ToggleGroup>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
