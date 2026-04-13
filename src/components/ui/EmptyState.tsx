import { Link } from "react-router-dom";
import { Card } from "./Card";

interface EmptyStateProps {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function EmptyState({ title, description, ctaLabel, ctaHref }: EmptyStateProps) {
  return (
    <Card className="px-6 py-10 text-center sm:px-12" tone="low">
      <div className="mx-auto max-w-xl space-y-4">
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold tracking-[-0.02em] text-on-surface sm:text-3xl">{title}</h3>
          <p className="text-base leading-7 text-on-surface-variant sm:text-lg">{description}</p>
        </div>
        {ctaLabel && ctaHref ? (
          <Link aria-label={ctaLabel} className="primary-button" to={ctaHref}>
            {ctaLabel}
          </Link>
        ) : null}
      </div>
    </Card>
  );
}
