import type { ReactNode } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: ReactNode;
  container?: Element | DocumentFragment;
}

/**
 * Renders children into a portal (default: document.body).
 * Useful for overlays, modals, toasts, and tooltips that need to escape overflow clipping.
 */
export function Portal({ children, container }: PortalProps) {
  return createPortal(children, container ?? document.body);
}
