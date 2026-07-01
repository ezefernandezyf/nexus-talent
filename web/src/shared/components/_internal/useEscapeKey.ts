import { useEffect, useRef } from "react";

/**
 * Calls `callback` when the Escape key is pressed.
 * Uses a ref to always invoke the latest callback without re-binding the listener.
 */
export function useEscapeKey(callback: () => void): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        callbackRef.current();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
