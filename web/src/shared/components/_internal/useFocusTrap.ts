import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

/**
 * Traps keyboard focus within the given container element when `active` is true.
 * Focuses the first focusable element on activation and wraps Tab/Shift+Tab cycling.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
): void {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  // Keep the direction ref stable across renders
  const directionRef = useRef<"forward" | "backward" | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) {
      return;
    }

    const container = containerRef.current;

    // Save previously focused element
    if (document.activeElement instanceof HTMLElement) {
      previousFocusRef.current = document.activeElement;
    }

    // Focus first focusable element on activation
    const elements = getFocusableElements(container);
    if (elements.length > 0) {
      elements[0].focus();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements(container);
      if (focusableElements.length === 0) {
        return;
      }

      const currentIndex = focusableElements.indexOf(
        document.activeElement as HTMLElement,
      );
      const lastIndex = focusableElements.length - 1;

      if (event.shiftKey && currentIndex <= 0) {
        // Shift+Tab on first element: wrap to last
        event.preventDefault();
        focusableElements[lastIndex].focus();
      } else if (!event.shiftKey && currentIndex === lastIndex) {
        // Tab on last element: wrap to first
        event.preventDefault();
        focusableElements[0].focus();
      }
    }

    // Safety net: if focus somehow escapes (e.g., userEvent.tab()), redirect back
    function handleFocusIn(event: FocusEvent) {
      const target = event.target as HTMLElement | null;
      if (!target || !container || container.contains(target)) {
        return;
      }

      const elements = getFocusableElements(container);
      if (elements.length === 0) {
        return;
      }

      directionRef.current =
        directionRef.current === "backward" ? "backward" : "forward";
      if (directionRef.current === "backward") {
        elements[elements.length - 1].focus();
      } else {
        elements[0].focus();
      }
      directionRef.current = null;
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);

      // Restore previous focus
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === "function") {
        previousFocusRef.current.focus();
      }
    };
  }, [active, containerRef]);
}
