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
        "text-eyebrow",
        className,
      )}
    >
      {children}
    </div>
  );
}
