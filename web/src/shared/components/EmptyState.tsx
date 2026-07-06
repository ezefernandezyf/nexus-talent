import { Link } from "react-router-dom";
import { Card } from "./Card";
import { cn } from "@/shared/utils/cn";

const linkBtnPrimary = cn(
  "inline-flex items-center justify-center rounded-full font-label select-none",
  "transition-all duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
  "bg-[var(--accent)] text-[var(--color-on-brand)]",
  "hover:brightness-105 hover:-translate-y-0.5 active:scale-[0.97]",
  "h-10 px-4 text-label text-base gap-2",
);

interface EmptyStateProps {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function EmptyState({ title, description, ctaLabel, ctaHref }: EmptyStateProps) {
  return (
    <Card className="px-5 py-8 text-center sm:px-8 sm:py-10" tone="low">
      <div className="mx-auto max-w-lg space-y-3 sm:space-y-4">
        <div className="space-y-2 sm:space-y-3">
          <h3 className="text-2xl font-semibold tracking-[-0.02em] text-on-surface sm:text-3xl">{title}</h3>
          <p className="text-base leading-7 text-on-surface-variant sm:text-lg">{description}</p>
        </div>
        {ctaLabel && ctaHref ? (
          <div className="flex justify-center">
            <Link aria-label={ctaLabel} className={linkBtnPrimary} to={ctaHref}>
              {ctaLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
