import type { HTMLAttributes } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";

export interface FooterProps extends HTMLAttributes<HTMLElement> {}

export function Footer({ className, ...props }: FooterProps) {
  return (
    <footer
      className={cn(
        "w-full border-t border-outline-variant/15 bg-surface-container-lowest px-8 py-12 text-xs uppercase tracking-widest text-on-surface-variant",
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-6 font-label sm:flex-row">
        <div className="text-lg font-black text-on-surface">Nexus talent</div>
        <div className="flex items-center gap-8">
          <Link className="text-on-surface/50 transition-colors hover:text-primary" to="/privacy">
            Privacy
          </Link>
          <a className="text-on-surface/50 transition-colors hover:text-primary" href="#">
            GitHub
          </a>
        </div>
        <div className="text-on-surface/50">© 2026 Nexus talent. Built for the machine era.</div>
      </div>
    </footer>
  );
}