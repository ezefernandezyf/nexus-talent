import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export interface FooterProps extends HTMLAttributes<HTMLElement> {}

export function Footer({ className, ...props }: FooterProps) {
  return (
    <footer
      className={cn(
        "surface-panel flex flex-col gap-2 px-5 py-4 text-sm text-on-surface-variant sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      {...props}
    >
      <p>© 2026 Nexus Talent — Precision Recruiting Layer</p>
      <p className="font-label text-[0.68rem] uppercase tracking-[0.24em] text-on-surface-variant">Deep Space UI</p>
    </footer>
  );
}