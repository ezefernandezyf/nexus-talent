import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LabelProps {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Label({
  children,
  htmlFor,
  className,
}: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("block text-sm font-medium text-text-primary mb-2", className)}
    >
      {children}
    </label>
  );
}
