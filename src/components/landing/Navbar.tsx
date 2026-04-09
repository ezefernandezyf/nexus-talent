import type { ReactNode } from "react";

function BrandMark() {
  return (
    <span aria-hidden="true" className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(142,213,255,0.16)]">
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3.5L20 8.2V15.8L12 20.5L4 15.8V8.2L12 3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M8.5 12.5L11 15L15.5 9.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export interface NavbarProps {
  actions?: ReactNode;
  brand: ReactNode;
  links?: ReactNode;
}

export function Navbar({ actions, brand, links }: NavbarProps) {
  return (
    <nav className="w-full border-b border-outline-variant/15 bg-[#0B0E14] dark:bg-[#0B0E14]">
      <div className="flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto font-['Inter'] tracking-tight">
        <div className="flex items-center gap-3 text-xl font-bold tracking-tighter text-on-surface" style={{}}>
          <BrandMark />
          <span>{brand}</span>
        </div>
        {links}
        {actions}
      </div>
    </nav>
  );
}
