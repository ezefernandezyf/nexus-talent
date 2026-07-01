import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useEscapeKey } from "./useEscapeKey";

describe("useEscapeKey", () => {
  it("calls the callback when Escape is pressed", () => {
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey(onEscape));

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it("does NOT call the callback for other keys", () => {
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey(onEscape));

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it("cleans up the listener on unmount", () => {
    const onEscape = vi.fn();
    const { unmount } = renderHook(() => useEscapeKey(onEscape));

    unmount();

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(onEscape).not.toHaveBeenCalled();
  });

  it("uses the latest callback reference", () => {
    const onEscape1 = vi.fn();
    const onEscape2 = vi.fn();
    const { rerender } = renderHook((cb) => useEscapeKey(cb), {
      initialProps: onEscape1,
    });

    rerender(onEscape2);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(onEscape2).toHaveBeenCalledTimes(1);
    expect(onEscape1).not.toHaveBeenCalled();
  });
});
