import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export type StatusVariant = "info" | "success" | "warning" | "error" | "neutral";

export interface StatusProps {
  variant: StatusVariant;
  children: ReactNode;
  className?: string;
}

const dotStyles: Record<StatusVariant, string> = {
  info: "bg-[var(--color-info)]",
  success: "bg-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]",
  error: "bg-[var(--color-error)]",
  neutral: "bg-[var(--color-on-surface-variant)]",
};

const labelStyles: Record<StatusVariant, string> = {
  info: "text-[var(--color-info)]",
  success: "text-[var(--color-success)]",
  warning: "text-[var(--color-warning)]",
  error: "text-[var(--color-error)]",
  neutral: "text-[var(--color-on-surface-variant)]",
};

export function Status({
  variant,
  children,
  className,
}: StatusProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-body text-xs font-medium",
        labelStyles[variant],
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          dotStyles[variant],
        )}
        aria-hidden="true"
      />
      {children}
    </span>
  );
}
