import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";
import { Drawer } from "./Drawer";

describe("Modal snapshots", () => {
  it("renders modal in dark mode", () => {
    document.documentElement.setAttribute("data-theme", "dark");

    const { container } = render(
      <Modal open onClose={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});

describe("Drawer snapshots", () => {
  it("renders drawer in dark mode", () => {
    document.documentElement.setAttribute("data-theme", "dark");

    const { container } = render(
      <Drawer open onClose={vi.fn()} title="Settings">
        <p>Drawer content</p>
      </Drawer>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders left-positioned drawer", () => {
    document.documentElement.setAttribute("data-theme", "dark");

    const { container } = render(
      <Drawer open onClose={vi.fn()} title="Settings" side="left">
        <p>Left drawer content</p>
      </Drawer>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
