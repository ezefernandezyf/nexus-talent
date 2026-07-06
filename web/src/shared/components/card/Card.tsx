import { type HTMLAttributes, type PropsWithChildren, type ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CardPadding = "sm" | "md" | "lg";

export interface CardProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
  /** Whether the card is interactive (hover lift + deeper shadow) */
  interactive?: boolean;
  /** Whether the card uses the accent-muted background */
  muted?: boolean;
  padding?: CardPadding;
}

interface CardSubProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const paddingStyles: Record<CardPadding, string> = {
  sm: "p-3",
  md: "p-4",
  lg: "p-8",
};

// ---------------------------------------------------------------------------
// Sub-components — deprecated, kept as re-exports for backward compat
// ---------------------------------------------------------------------------

/**
 * @deprecated Card sub-components are deprecated. Use plain divs with
 * appropriate typography classes instead. Will be removed in a future PR.
 */
function CardHeader({ className, children, ...props }: CardSubProps) {
  return (
    <div className={cn("font-display text-lg font-semibold text-text-primary", className)} {...props}>
      {children}
    </div>
  );
}

/**
 * @deprecated Card sub-components are deprecated. Will be removed in a future PR.
 */
function CardBody({ className, children, ...props }: CardSubProps) {
  return (
    <div className={cn("text-body text-text-secondary", className)} {...props}>
      {children}
    </div>
  );
}

/**
 * @deprecated Card sub-components are deprecated. Will be removed in a future PR.
 */
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
  interactive = false,
  muted = false,
  padding = "lg",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface transition-all duration-200",
        "shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]",
        muted && "bg-[var(--accent-muted)]",
        interactive && "hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] cursor-pointer",
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
