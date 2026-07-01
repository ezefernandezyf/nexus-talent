import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export type BadgeVariant = "info" | "success" | "warning" | "error" | "brand" | "neutral";
export type BadgeSize = "sm" | "md";

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  info: "bg-[var(--color-info)]/10 text-[var(--color-info)]",
  success: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
  error: "bg-[var(--color-error)]/10 text-[var(--color-error)]",
  brand: "bg-[var(--color-brand)]/10 text-[var(--color-brand)]",
  neutral: "bg-[var(--color-surface-elevated-2)] text-[var(--color-on-surface-variant)]",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "h-5 px-1.5 text-[0.65rem]",
  md: "h-6 px-2 text-[0.7rem]",
};

export function Badge({
  variant = "info",
  size = "md",
  icon,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[var(--radius-full)] font-body font-medium",
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
