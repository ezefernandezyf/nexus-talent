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
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-4 tracking-tight sm:px-6 lg:px-8">
        {brandHref ? (
          <Link className="flex items-center gap-3 text-lg font-bold tracking-tighter text-on-surface transition-opacity hover:opacity-90 sm:text-xl" to={brandHref}>
            {brandContent}
          </Link>
        ) : (
          <div className="flex items-center gap-3 text-lg font-bold tracking-tighter text-on-surface sm:text-xl" style={{}}>
            {brandContent}
          </div>
        )}
        {links}
        {actions}
      </div>
    </nav>
  );
}
