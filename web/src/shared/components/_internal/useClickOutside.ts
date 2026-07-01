import type { RefObject } from "react";
import { useEffect } from "react";

/**
 * Calls `callback` when a mousedown event is dispatched outside the given `ref` element.
 * Uses mousedown (not click) to trigger before focus/blur events, enabling earlier capture.
 */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  callback: () => void,
): void {
  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      callback();
    }

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [ref, callback]);
}
