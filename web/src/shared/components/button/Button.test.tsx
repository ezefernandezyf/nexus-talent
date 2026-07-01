import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button, type ButtonProps } from "./Button";

// We test the Button component directly.
// Loading spinner is identified by aria-label="Loading".

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit</Button>);

    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Submit</Button>);

    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("shows a spinner when loading", () => {
    render(<Button loading>Save</Button>);
    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
  });

  it("does not call onClick when loading", async () => {
    const handleClick = vi.fn();
    render(<Button loading onClick={handleClick}>Save</Button>);

    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("renders correctly with each variant", () => {
    const variants: Array<ButtonProps["variant"]> = ["primary", "secondary", "ghost", "danger"];
    for (const variant of variants) {
      const { unmount } = render(<Button variant={variant}>{variant}</Button>);
      expect(screen.getByRole("button", { name: variant })).toBeInTheDocument();
      unmount();
    }
  });

  it("renders correctly with each size", () => {
    const sizes: Array<ButtonProps["size"]> = ["sm", "md", "lg"];
    for (const size of sizes) {
      const { unmount } = render(<Button size={size}>{size}</Button>);
      expect(screen.getByRole("button", { name: size })).toBeInTheDocument();
      unmount();
    }
  });

  it("forwards the ref to the button element", () => {
    const ref = { current: null };
    render(<Button ref={ref}>Ref test</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("renders an icon prefix", () => {
    render(<Button iconPrefix={<span data-testid="prefix-icon" />}>With Icon</Button>);
    expect(screen.getByTestId("prefix-icon")).toBeInTheDocument();
  });

  it("renders an icon suffix", () => {
    render(<Button iconSuffix={<span data-testid="suffix-icon" />}>With Icon</Button>);
    expect(screen.getByTestId("suffix-icon")).toBeInTheDocument();
  });

  it("sets type='button' by default", () => {
    render(<Button>Default type</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("accepts a custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole("button").className).toContain("custom-class");
  });
});
