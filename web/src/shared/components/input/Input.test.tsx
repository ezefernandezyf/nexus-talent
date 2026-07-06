import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  it("renders an input element by default", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders a label when provided", () => {
    render(<Input label="Email" />);
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("associates label with input via htmlFor", () => {
    render(<Input label="Email" id="email" />);
    expect(screen.getByLabelText("Email")).toHaveAttribute("id", "email");
  });

  it("renders as a textarea when multiline is true", () => {
    render(<Input multiline label="Bio" />);
    expect(screen.getByLabelText("Bio").tagName).toBe("TEXTAREA");
  });

  it("shows an error message when error prop is provided", () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("links error message to input via aria-describedby", () => {
    render(<Input error="Required" id="test-input" />);
    const input = screen.getByRole("textbox");
    const errorId = input.getAttribute("aria-describedby");
    expect(errorId).toBeTruthy();
    expect(screen.getByText("Required")).toHaveAttribute("id", errorId);
  });

  it("disables the input when disabled prop is true", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("renders an icon prefix", () => {
    render(<Input iconPrefix={<span data-testid="prefix-icon" />} />);
    expect(screen.getByTestId("prefix-icon")).toBeInTheDocument();
  });

  it("renders an icon suffix", () => {
    render(<Input iconSuffix={<span data-testid="suffix-icon" />} />);
    expect(screen.getByTestId("suffix-icon")).toBeInTheDocument();
  });

  it("calls onChange when typing", async () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);

    await userEvent.type(screen.getByRole("textbox"), "a");
    expect(handleChange).toHaveBeenCalled();
  });

  it("forwards the ref to the input element", () => {
    const ref = { current: null };
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
