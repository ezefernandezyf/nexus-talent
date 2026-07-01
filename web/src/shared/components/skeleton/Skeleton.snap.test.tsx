import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./Skeleton";

describe("Skeleton snapshots", () => {
  it("renders all variants in dark mode", () => {
    document.documentElement.setAttribute("data-theme", "dark");

    const { container } = render(
      <div>
        <Skeleton variant="text" />
        <Skeleton variant="text" count={3} />
        <Skeleton variant="circle" width={40} height={40} />
        <Skeleton variant="rect" width={200} height={120} />
      </div>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it("uses pulse animation class", () => {
    const { container } = render(<Skeleton variant="text" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("animate-pulse");
  });
});
