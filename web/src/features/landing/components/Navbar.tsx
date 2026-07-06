import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export interface NavbarProps {
  actions?: ReactNode;
  brand: ReactNode;
  brandHref?: string;
  links?: ReactNode;
}

export function Navbar({ actions, brand, brandHref, links }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface/85 backdrop-blur-sm">
      <div className="container-editorial flex h-16 items-center justify-between">
        {brandHref ? (
          <Link
            className="font-display text-lg font-bold tracking-tight text-text-primary transition-opacity hover:opacity-90 sm:text-xl"
            to={brandHref}
          >
            {brand}
          </Link>
        ) : (
          <div className="font-display text-lg font-bold tracking-tight text-text-primary sm:text-xl">
            {brand}
          </div>
        )}
        <div className="flex items-center gap-4">
          {links}
          {actions}
        </div>
      </div>
    </nav>
  );
}
