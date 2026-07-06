import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export function Badge({
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[6px] bg-[var(--accent-muted)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
