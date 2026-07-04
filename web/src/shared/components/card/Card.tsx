import { type HTMLAttributes, type PropsWithChildren } from "react";
import { cn } from "@/shared/utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CardVariant = "flat" | "elevated" | "interactive";
export type CardPadding = "sm" | "md" | "lg";

export interface CardProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
  variant?: CardVariant;
  padding?: CardPadding;
}

interface CardSubProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const variantStyles: Record<CardVariant, string> = {
  flat:
    "bg-[var(--color-surface-elevated-1)] border border-[var(--border)]",
  elevated:
    "bg-[var(--color-surface-elevated-1)] border border-[var(--border)] shadow-[var(--shadow-md)]",
  interactive:
    "bg-[var(--color-surface-elevated-1)] border border-[var(--border)] shadow-[var(--shadow-sm)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] cursor-pointer transition-all duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
};

const paddingStyles: Record<CardPadding, string> = {
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CardHeader({ className, children, ...props }: CardSubProps) {
  return (
    <div className={cn("font-display text-lg font-semibold text-[var(--text-primary)]", className)} {...props}>
      {children}
    </div>
  );
}

function CardBody({ className, children, ...props }: CardSubProps) {
  return (
    <div className={cn("text-body text-[var(--color-on-surface-variant)]", className)} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ className, children, ...props }: CardSubProps) {
  return (
    <div className={cn("flex items-center gap-2 pt-2", className)} {...props}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component — compound pattern via static properties
// ---------------------------------------------------------------------------

function CardBase({
  className,
  variant = "flat",
  padding = "md",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] flex flex-col gap-2",
        variantStyles[variant],
        paddingStyles[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

CardBase.Header = CardHeader;
CardBase.Body = CardBody;
CardBase.Footer = CardFooter;

export const Card = CardBase as typeof CardBase & {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
};
