import type { SavedJobAnalysis } from "@/features/analysis/schemas/job-analysis";
import { Link } from "react-router-dom";
import { Badge } from "@/shared/components/Badge";
import {
  formatHistoryCardDate,
  getHistoryCompanyLabel,
  getHistoryRoleLabel,
} from "@/features/history/history-formatters";

interface HistoryCardProps {
  analysis: SavedJobAnalysis;
}

export function HistoryCard({ analysis }: HistoryCardProps) {
  const companyLabel = getHistoryCompanyLabel(analysis);
  const roleLabel = getHistoryRoleLabel(analysis);

  return (
    <Link
      to={`/app/history/${analysis.id}`}
      className="flex items-center justify-between rounded-lg border border-border bg-surface p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
      aria-label={`Abrir detalle de ${companyLabel}`}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate text-sm font-semibold text-text-primary" title={companyLabel}>
          {companyLabel}
        </p>
        <p className="text-sm text-text-secondary">{formatHistoryCardDate(analysis.createdAt)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Badge>{roleLabel}</Badge>
        <span className="material-symbols-outlined text-lg text-text-secondary" aria-hidden="true">
          arrow_forward_ios
        </span>
      </div>
    </Link>
  );
}
