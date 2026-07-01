import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Toast } from "./Toast";

describe("Toast snapshots", () => {
  it("renders all variants in dark mode", () => {
    document.documentElement.setAttribute("data-theme", "dark");

    const { container } = render(
      <div>
        <Toast id="1" message="Success message" variant="success" onDismiss={() => {}} />
        <Toast id="2" message="Error message" variant="error" onDismiss={() => {}} />
        <Toast id="3" message="Warning message" variant="warning" onDismiss={() => {}} />
        <Toast id="4" message="Info message" variant="info" onDismiss={() => {}} />
      </div>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
