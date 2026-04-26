import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export interface MobileMenuButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isOpen: boolean;
}

export function MobileMenuButton({ className, isOpen, ...props }: MobileMenuButtonProps) {
  return (
    <button
      aria-controls="mobile-navigation-drawer"
      aria-expanded={isOpen}
      aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl bg-surface-container-high/70 px-4 py-3 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-white focus-visible:outline-none focus-visible:ring-0 md:hidden",
        className,
      )}
      type="button"
      {...props}
    >
      <span aria-hidden="true" className="relative block h-4 w-5">
        <span
          className={cn(
            "absolute left-0 top-0 h-0.5 w-full rounded-full bg-current transition-transform duration-200",
            isOpen ? "translate-y-2 rotate-45" : "",
          )}
        />
        <span
          className={cn(
            "absolute left-0 top-1.5 h-0.5 w-full rounded-full bg-current transition-opacity duration-200",
            isOpen ? "opacity-0" : "",
          )}
        />
        <span
          className={cn(
            "absolute left-0 top-3 h-0.5 w-full rounded-full bg-current transition-transform duration-200",
            isOpen ? "-translate-y-2 -rotate-45" : "",
          )}
        />
      </span>
      <span className="sr-only">{isOpen ? "Cerrar menú" : "Abrir menú"}</span>
    </button>
  );
}