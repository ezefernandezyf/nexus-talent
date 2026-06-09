import type { SavedJobAnalysis } from "../../../schemas/job-analysis";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import {
  formatHistoryCardDate,
  getHistoryCompanyLabel,
  getHistoryRoleLabel,
  getHistorySummarySnippet,
  getHistoryUid,
} from "../history-formatters";

interface HistoryCardProps {
  analysis: SavedJobAnalysis;
  isDeleting?: boolean;
  iconName: string;
  onDelete: (analysisId: string) => void;
}

export function HistoryCard({ analysis, iconName, isDeleting = false, onDelete }: HistoryCardProps) {
  const companyLabel = getHistoryCompanyLabel(analysis);
  const roleLabel = getHistoryRoleLabel(analysis);
  const summarySnippet = getHistorySummarySnippet(analysis.summary, 120);
  const uidLabel = getHistoryUid(analysis);

  return (
    <article
      className="group relative grid grid-cols-1 items-center gap-4 rounded-xl border border-transparent bg-surface-container-low/40 px-4 py-4 transition-all duration-200 hover:border-outline-variant/10 hover:bg-surface-container sm:px-5 sm:py-5 lg:grid-cols-12 lg:gap-0"
      aria-labelledby={`history-title-${analysis.id}`}
      role="listitem"
      tabIndex={0}
    >
      <Link
        aria-label={`Abrir detalle de ${companyLabel}`}
        className="absolute inset-0 z-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        to={`/app/history/${analysis.id}`}
      >
        <span className="sr-only">Abrir detalle</span>
      </Link>

      <div className="flex min-w-0 items-start gap-4 lg:col-span-4 lg:items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container-lowest">
          <span className="material-symbols-outlined text-primary" aria-hidden="true">
            {iconName}
          </span>
        </div>
        <div className="min-w-0">
          <p id={`history-title-${analysis.id}`} className="truncate text-sm font-semibold text-on-surface" title={companyLabel}>
            {companyLabel}
          </p>
          <p className="truncate font-label text-[10px] tracking-widest text-primary/70" title={uidLabel}>
            {uidLabel}
          </p>
        </div>
      </div>

      <div className="lg:col-span-4 lg:mt-0">
        <div className="space-y-2">
          <span className="inline-flex max-w-full truncate rounded-full border border-outline-variant/10 bg-surface-container-highest/50 px-3 py-1 font-label text-[11px] text-on-surface-variant" title={roleLabel}>
            {roleLabel}
          </span>
          <p className="max-w-xl text-sm leading-6 text-on-surface-variant">
            {summarySnippet}
          </p>
        </div>
      </div>

      <div className="text-left text-xs text-on-surface-variant lg:col-span-2 lg:text-right">
        {formatHistoryCardDate(analysis.createdAt)}
      </div>

      <div className="relative z-10 flex justify-start lg:col-span-2 lg:justify-end">
        <Button
          aria-label={`Eliminar ${companyLabel}`}
          className="w-full opacity-100 transition-opacity focus:opacity-100 focus-visible:ring-2 focus-visible:ring-primary/40 sm:w-auto lg:opacity-0 lg:group-hover:opacity-100"
          disabled={isDeleting}
          type="button"
          variant="secondary"
          onClick={() => onDelete(analysis.id)}
        >
          {isDeleting ? "..." : "Eliminar"}
        </Button>
      </div>
    </article>
  );
}
