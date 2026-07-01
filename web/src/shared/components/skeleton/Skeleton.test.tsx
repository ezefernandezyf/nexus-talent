import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("renders a single text line by default", () => {
    const { container } = render(<Skeleton variant="text" />);

    const el = container.firstChild as HTMLElement;
    expect(el).toBeInTheDocument();
    expect(el.className).toContain("animate-pulse");
  });

  it("renders a circle skeleton with the given width/height", () => {
    const { container } = render(<Skeleton variant="circle" width={40} height={40} />);

    const el = container.firstChild as HTMLElement;
    expect(el).toBeInTheDocument();
    expect(el.style.width).toBe("40px");
    expect(el.style.height).toBe("40px");
    expect(el.className).toContain("rounded-full");
  });

  it("renders a rectangle skeleton", () => {
    const { container } = render(<Skeleton variant="rect" width={200} height={100} />);

    const el = container.firstChild as HTMLElement;
    expect(el).toBeInTheDocument();
    expect(el.style.width).toBe("200px");
    expect(el.style.height).toBe("100px");
  });

  it("renders multi-line text with count prop", () => {
    const { container } = render(<Skeleton variant="text" count={3} />);

    const children = container.firstChild?.childNodes;
    expect(children).toHaveLength(3);
  });

  it("uses pulse animation by default", () => {
    const { container } = render(<Skeleton variant="text" />);

    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("animate-pulse");
  });

  it("applies custom className", () => {
    const { container } = render(<Skeleton variant="text" className="custom-class" />);

    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("custom-class");
  });
});
