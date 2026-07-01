import { renderHook } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { useClickOutside } from "./useClickOutside";

describe("useClickOutside", () => {
  it("calls the callback when clicking outside the ref element", () => {
    const ref = createRef<HTMLDivElement>();
    const onClickOutside = vi.fn();

    // Mount a div into the DOM for the ref
    const div = document.createElement("div");
    document.body.appendChild(div);
    ref.current = div;

    renderHook(() => useClickOutside(ref, onClickOutside));

    // Click outside (on document.body)
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(onClickOutside).toHaveBeenCalledTimes(1);

    document.body.removeChild(div);
  });

  it("does NOT call the callback when clicking inside the ref element", () => {
    const ref = createRef<HTMLDivElement>();
    const onClickOutside = vi.fn();

    const div = document.createElement("div");
    document.body.appendChild(div);
    ref.current = div;

    renderHook(() => useClickOutside(ref, onClickOutside));

    // Click inside
    div.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(onClickOutside).not.toHaveBeenCalled();

    document.body.removeChild(div);
  });

  it("handles null ref gracefully without calling callback", () => {
    const ref = createRef<HTMLDivElement>();
    const onClickOutside = vi.fn();

    renderHook(() => useClickOutside(ref, onClickOutside));

    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(onClickOutside).not.toHaveBeenCalled();
  });

  it("cleans up the listener on unmount", () => {
    const ref = createRef<HTMLDivElement>();
    const onClickOutside = vi.fn();

    const div = document.createElement("div");
    document.body.appendChild(div);
    ref.current = div;

    const { unmount } = renderHook(() => useClickOutside(ref, onClickOutside));

    unmount();

    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(onClickOutside).not.toHaveBeenCalled();

    document.body.removeChild(div);
  });
});
