import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("renders when open is true", () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Test Modal">
        <Modal.Body>Modal content</Modal.Body>
      </Modal>,
    );

    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("does not render when open is false", () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="Test Modal">
        <Modal.Body>Modal content</Modal.Body>
      </Modal>,
    );

    expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();
  });

  it("calls onClose when Escape is pressed", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal open={true} onClose={onClose} title="Test Modal">
        <Modal.Body>Content</Modal.Body>
      </Modal>,
    );

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal open={true} onClose={onClose} title="Test Modal">
        <Modal.Body>Content</Modal.Body>
      </Modal>,
    );

    // The backdrop is the div with role="presentation" and onClick handler
    const backdrop = screen.getByTestId("modal-backdrop");
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders header, body, and actions", () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Modal Title">
        <Modal.Body>Body content</Modal.Body>
        <Modal.Actions>
          <button>Save</button>
        </Modal.Actions>
      </Modal>,
    );

    expect(screen.getByText("Modal Title")).toBeInTheDocument();
    expect(screen.getByText("Body content")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("locks body scroll when open", () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Test">
        <Modal.Body>Content</Modal.Body>
      </Modal>,
    );

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores body scroll when closed", () => {
    const { rerender } = render(
      <Modal open={true} onClose={vi.fn()} title="Test">
        <Modal.Body>Content</Modal.Body>
      </Modal>,
    );

    rerender(
      <Modal open={false} onClose={vi.fn()} title="Test">
        <Modal.Body>Content</Modal.Body>
      </Modal>,
    );

    expect(document.body.style.overflow).toBe("");
  });
});
