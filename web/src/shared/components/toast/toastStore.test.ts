import { describe, expect, it, beforeEach } from "vitest";
import { useToastStore } from "./toastStore";

describe("toastStore", () => {
  beforeEach(() => {
    useToastStore.getState().clearToasts();
  });

  it("adds a toast with default values", () => {
    const toast = useToastStore.getState().addToast({
      message: "Hello",
      variant: "info",
    });

    expect(toast.id).toBeDefined();
    expect(toast.message).toBe("Hello");
    expect(toast.variant).toBe("info");
    expect(toast.duration).toBe(5000);
  });

  it("adds a toast with custom duration", () => {
    const toast = useToastStore.getState().addToast({
      message: "Persistent",
      variant: "success",
      duration: 10000,
    });

    expect(toast.duration).toBe(10000);
  });

  it("generates unique IDs for each toast", () => {
    const t1 = useToastStore.getState().addToast({ message: "One", variant: "info" });
    const t2 = useToastStore.getState().addToast({ message: "Two", variant: "success" });

    expect(t1.id).not.toBe(t2.id);
  });

  it("removes a toast by id", () => {
    const toast = useToastStore.getState().addToast({ message: "Remove me", variant: "info" });
    useToastStore.getState().removeToast(toast.id);

    const toasts = useToastStore.getState().toasts;
    expect(toasts.find((t) => t.id === toast.id)).toBeUndefined();
  });

  it("clears all toasts", () => {
    useToastStore.getState().addToast({ message: "A", variant: "info" });
    useToastStore.getState().addToast({ message: "B", variant: "success" });

    useToastStore.getState().clearToasts();
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});
