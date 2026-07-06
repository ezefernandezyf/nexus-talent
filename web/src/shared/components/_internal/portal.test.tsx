import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Portal } from "./portal";

describe("Portal", () => {
  it("renders children into document.body", () => {
    render(
      <Portal>
        <div data-testid="portal-child">Portaled content</div>
      </Portal>,
    );

    const child = screen.getByTestId("portal-child");
    expect(child).toBeInTheDocument();
    expect(child.parentElement).toBe(document.body);
  });

  it("renders children into a custom container", () => {
    const customRoot = document.createElement("div");
    customRoot.setAttribute("data-testid", "custom-root");
    document.body.appendChild(customRoot);

    render(
      <Portal container={customRoot}>
        <div data-testid="custom-portal-child">Custom portaled</div>
      </Portal>,
    );

    const child = screen.getByTestId("custom-portal-child");
    expect(child).toBeInTheDocument();
    expect(child.parentElement).toBe(customRoot);

    document.body.removeChild(customRoot);
  });

  it("renders multiple children", () => {
    render(
      <Portal>
        <span data-testid="child-a">A</span>
        <span data-testid="child-b">B</span>
      </Portal>,
    );

    expect(screen.getByTestId("child-a")).toBeInTheDocument();
    expect(screen.getByTestId("child-b")).toBeInTheDocument();
  });
});
