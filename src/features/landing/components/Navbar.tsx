import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BrandMark } from "./BrandMark";

export interface NavbarProps {
  actions?: ReactNode;
  brand: ReactNode;
  brandHref?: string;
  links?: ReactNode;
}

export function Navbar({ actions, brand, brandHref, links }: NavbarProps) {
  const brandContent = (
    <>
      <BrandMark />
      <span>{brand}</span>
    </>
  );

  return (
    <nav className="w-full border-b border-outline-variant/15 bg-[#0B0E14] dark:bg-[#0B0E14]">
      <div className="flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto font-['Inter'] tracking-tight">
        {brandHref ? (
          <Link className="flex items-center gap-3 text-xl font-bold tracking-tighter text-on-surface transition-opacity hover:opacity-90" to={brandHref}>
            {brandContent}
          </Link>
        ) : (
          <div className="flex items-center gap-3 text-xl font-bold tracking-tighter text-on-surface" style={{}}>
            {brandContent}
          </div>
        )}
        {links}
        {actions}
      </div>
    </nav>
  );
}
