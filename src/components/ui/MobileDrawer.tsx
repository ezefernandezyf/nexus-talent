import { createPortal } from "react-dom";
import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface MobileDrawerItem {
  label: string;
  to: string;
}

export interface MobileDrawerProps {
  actions?: ReactNode;
  heading: string;
  isOpen: boolean;
  items: readonly MobileDrawerItem[];
  onClose: () => void;
}

function getDrawerLinkClassName({ isActive }: { isActive: boolean }) {
  return cn(
    "flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
    isActive ? "bg-surface-container-high text-white" : "text-on-surface-variant hover:bg-surface-container-high/60 hover:text-white",
  );
}

export function MobileDrawer({ actions, heading, isOpen, items, onClose }: MobileDrawerProps) {
  useEffect(() => {
    if (!isOpen || typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-40 lg:hidden">
      <button
        aria-label="Cerrar menú"
        className="absolute inset-0 z-0 cursor-default bg-surface-container-lowest/75 backdrop-blur-sm"
        type="button"
        onClick={onClose}
      />
      <aside
        aria-label={heading}
        aria-modal="true"
        className="absolute right-0 top-0 z-10 flex h-full w-[min(86vw,22rem)] flex-col gap-5 overflow-y-auto bg-surface-container-low px-5 py-5 shadow-[0_32px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/8 sm:px-6"
        id="mobile-navigation-drawer"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xl font-semibold tracking-[-0.03em] text-white">{heading}</p>
          </div>
          <button
            aria-label="Cerrar menú"
            className="rounded-full bg-surface-container-high/70 px-3 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-white"
            type="button"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>

        <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
          {items.map((item) => (
            <NavLink key={item.to} className={getDrawerLinkClassName} to={item.to} onClick={onClose}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {actions ? <div className="mt-auto space-y-3 pt-5">{actions}</div> : null}
      </aside>
    </div>,
    document.body,
  );
}