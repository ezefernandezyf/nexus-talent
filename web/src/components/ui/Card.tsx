import type { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../../lib/cn";

interface CardProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
  tone?: "surface" | "low" | "lowest";
}

const toneClassName: Record<NonNullable<CardProps["tone"]>, string> = {
  surface: "bg-surface-container",
  low: "bg-surface-container-low",
  lowest: "bg-surface-container-lowest",
};

export function Card({ className, children, tone = "surface", ...props }: CardProps) {
  return (
    <div className={cn("rounded-xl", toneClassName[tone], className)} {...props}>
      {children}
    </div>
  );
}