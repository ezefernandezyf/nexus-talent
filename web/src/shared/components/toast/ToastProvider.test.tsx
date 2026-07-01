import { render, screen, act, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ToastProvider } from "./ToastProvider";
import { useToastStore } from "./toastStore";

describe("ToastProvider", () => {
  beforeEach(() => {
    act(() => {
      useToastStore.getState().clearToasts();
    });
  });

  it("renders toasts from the store", () => {
    render(<ToastProvider />);

    act(() => {
      useToastStore.getState().addToast({ message: "Hello", variant: "info" });
    });

    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("renders multiple toasts", () => {
    render(<ToastProvider />);

    act(() => {
      useToastStore.getState().addToast({ message: "First", variant: "info" });
      useToastStore.getState().addToast({ message: "Second", variant: "success" });
    });

    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  it("removes a toast when dismissed", async () => {
    render(<ToastProvider />);

    let toastId: string;
    act(() => {
      const t = useToastStore.getState().addToast({
        message: "Dismiss me",
        variant: "info",
      });
      toastId = t.id;
    });

    act(() => {
      useToastStore.getState().removeToast(toastId!);
    });

    // Wait for exit animation to complete
    await waitFor(() => {
      expect(screen.queryByText("Dismiss me")).not.toBeInTheDocument();
    });
  });
});
