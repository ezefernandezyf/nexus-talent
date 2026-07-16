import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Accordion } from "./Accordion";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function AccordionExample({ defaultOpen }: { defaultOpen?: string }) {
  return (
    <Accordion.Root defaultOpen={defaultOpen}>
      <Accordion.Item id="account">
        <Accordion.Trigger>Account</Accordion.Trigger>
        <Accordion.Content>
          <p>Account settings content</p>
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item id="appearance">
        <Accordion.Trigger>Appearance</Accordion.Trigger>
        <Accordion.Content>
          <p>Appearance settings content</p>
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item id="data">
        <Accordion.Trigger>Data</Accordion.Trigger>
        <Accordion.Content>
          <p>Data settings content</p>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}

function getTrigger(name: string) {
  return screen.getByRole("button", { name });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Accordion", () => {
  it("renders all trigger labels", () => {
    render(<AccordionExample />);

    expect(getTrigger("Account")).toBeInTheDocument();
    expect(getTrigger("Appearance")).toBeInTheDocument();
    expect(getTrigger("Data")).toBeInTheDocument();
  });

  it("collapses all content when no defaultOpen is set", () => {
    render(<AccordionExample />);

    expect(getTrigger("Account")).toHaveAttribute("aria-expanded", "false");
    expect(getTrigger("Appearance")).toHaveAttribute("aria-expanded", "false");
    expect(getTrigger("Data")).toHaveAttribute("aria-expanded", "false");
  });

  it("shows the defaultOpen item's content on mount", () => {
    render(<AccordionExample defaultOpen="account" />);

    expect(getTrigger("Account")).toHaveAttribute("aria-expanded", "true");
    expect(getTrigger("Appearance")).toHaveAttribute("aria-expanded", "false");
  });

  it("expands content when a trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<AccordionExample />);

    await user.click(getTrigger("Account"));
    expect(getTrigger("Account")).toHaveAttribute("aria-expanded", "true");
  });

  it("collapses content when the open trigger is clicked again", async () => {
    const user = userEvent.setup();
    render(<AccordionExample defaultOpen="account" />);

    await user.click(getTrigger("Account"));
    expect(getTrigger("Account")).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the previous item when a different item is opened (single-expand)", async () => {
    const user = userEvent.setup();
    render(<AccordionExample defaultOpen="account" />);

    await user.click(getTrigger("Appearance"));
    expect(getTrigger("Appearance")).toHaveAttribute("aria-expanded", "true");
    expect(getTrigger("Account")).toHaveAttribute("aria-expanded", "false");
  });

  it("sets aria-expanded correctly on triggers", () => {
    render(<AccordionExample defaultOpen="account" />);

    expect(getTrigger("Account")).toHaveAttribute("aria-expanded", "true");
    expect(getTrigger("Appearance")).toHaveAttribute("aria-expanded", "false");
  });

  it("links trigger aria-controls to content id", () => {
    render(<AccordionExample defaultOpen="account" />);

    const trigger = getTrigger("Account");
    const contentId = trigger.getAttribute("aria-controls");
    const content = document.getElementById(contentId!);

    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute("role", "region");
    expect(content).toHaveAttribute("aria-labelledby", trigger.id);
  });

  it("expands content via Enter key on trigger", async () => {
    const user = userEvent.setup();
    render(<AccordionExample />);

    const trigger = getTrigger("Account");
    trigger.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByText("Account settings content")).toBeInTheDocument();
  });

  it("expands content via Space key on trigger", async () => {
    const user = userEvent.setup();
    render(<AccordionExample />);

    const trigger = getTrigger("Appearance");
    trigger.focus();
    await user.keyboard(" ");

    expect(screen.getByText("Appearance settings content")).toBeInTheDocument();
  });

  it("collapses via Enter when already open", async () => {
    const user = userEvent.setup();
    render(<AccordionExample defaultOpen="account" />);

    const trigger = getTrigger("Account");
    trigger.focus();
    await user.keyboard("{Enter}");

    expect(getTrigger("Account")).toHaveAttribute("aria-expanded", "false");
  });
});
