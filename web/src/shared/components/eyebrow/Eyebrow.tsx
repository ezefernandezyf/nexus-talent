import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export interface EyebrowProps {
  children: ReactNode;
  className?: string;
}

export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <div
      className={cn(
        "text-[var(--text-eyebrow)] uppercase tracking-[0.15em] font-medium text-[var(--color-brand)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
