import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type BadgeVariant = "info" | "success" | "warning" | "error";
type BadgeSize = "sm" | "md";

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  info: "bg-primary/10 text-on-surface border border-primary/25",
  success: "bg-success/10 text-on-surface border border-success/25",
  warning: "bg-warning/10 text-on-surface border border-warning/25",
  error: "bg-error/10 text-on-surface border border-error/25",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[0.65rem]",
  md: "px-2.5 py-1 text-[0.75rem]",
};

export function Badge({ variant = "info", size = "md", icon, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-label font-semibold uppercase tracking-wider",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {icon ? <span className="flex-shrink-0 text-[1em] leading-none">{icon}</span> : null}
      {children}
    </span>
  );
}
