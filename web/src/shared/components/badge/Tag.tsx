import type { ReactNode } from "react";
import { X } from "@phosphor-icons/react";
import { cn } from "@/shared/utils/cn";
import type { BadgeVariant } from "./Badge";

export interface TagProps {
  variant?: BadgeVariant;
  children: ReactNode;
  onRemove?: () => void;
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

export function Tag({
  variant = "neutral",
  children,
  onRemove,
  className,
}: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[var(--radius-full)] px-2 py-0.5 text-[0.7rem] font-body font-medium",
        variantStyles[variant],
        className,
      )}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          aria-label="Remove"
          onClick={onRemove}
          className="ml-0.5 flex items-center justify-center rounded-full p-0.5 opacity-60 transition-opacity hover:opacity-100"
        >
          <X size={10} weight="bold" />
        </button>
      )}
    </span>
  );
}
