import type { HTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual variant — text (default), circle, or rectangle */
  variant?: "text" | "circle" | "rect";
  /** Width in px (or string like "100%"). Default: text=100%, circle=40, rect=100% */
  width?: number | string;
  /** Height in px (or string like "100%"). Default: text=16, circle=40, rect=100 */
  height?: number | string;
  /** Number of lines (text only). Default: 1 */
  count?: number;
}

/**
 * Skeleton loader primitives with pulse animation.
 *
 * Variants:
 * - `text`  — rounded line(s) for body / heading placeholders
 * - `circle` — perfect circle for avatars / icons
 * - `rect` — rounded rectangle for cards / images
 */
export function Skeleton({
  variant = "text",
  width,
  height,
  count = 1,
  className,
  ...props
}: SkeletonProps) {
  const resolveWidth = width ?? (variant === "circle" ? 40 : "100%");
  const resolveHeight = height ?? (variant === "circle" ? 40 : variant === "rect" ? 100 : 16);

  const style: Record<string, string> = {
    width: typeof resolveWidth === "number" ? `${resolveWidth}px` : resolveWidth,
    height: typeof resolveHeight === "number" ? `${resolveHeight}px` : resolveHeight,
  };

  const baseClasses = cn(
    "animate-pulse bg-[var(--color-on-surface)]/10",
    variant === "text" && "rounded-md",
    variant === "circle" && "rounded-full",
    variant === "rect" && "rounded-lg",
    className,
  );

  if (variant === "text" && count > 1) {
    return (
      <div className="flex flex-col gap-2" {...props}>
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            className={baseClasses}
            style={{
              ...style,
              width: i === count - 1 ? "75%" : style.width,
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={baseClasses}
      style={style}
      aria-hidden="true"
      {...props}
    />
  );
}
