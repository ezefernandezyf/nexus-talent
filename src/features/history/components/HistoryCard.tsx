import type { SavedJobAnalysis } from "../../../schemas/job-analysis";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import {
  formatHistoryCardDate,
  getHistoryCompanyLabel,
  getHistoryMatchPercentage,
  getHistoryMatchTone,
  getHistoryRoleLabel,
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
  const uidLabel = getHistoryUid(analysis);
  const matchPercentage = getHistoryMatchPercentage(analysis);
  const matchTone = getHistoryMatchTone(matchPercentage);

  const matchValueClassName =
    matchTone === "primary"
      ? "text-primary"
      : matchTone === "on-surface"
      ? "text-on-surface"
      : "text-on-surface-variant";

  const progressClassName =
    matchTone === "primary"
      ? "bg-primary"
      : matchTone === "on-surface"
      ? "bg-on-surface-variant"
      : "bg-outline-variant/40";

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

      <div className="flex items-center gap-4 lg:col-span-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container-lowest">
          <span className="material-symbols-outlined text-primary" aria-hidden="true">
            {iconName}
          </span>
        </div>
        <div>
          <p id={`history-title-${analysis.id}`} className="text-sm font-semibold text-on-surface">{companyLabel}</p>
          <p className="font-label text-[10px] tracking-widest text-primary/70">{uidLabel}</p>
        </div>
      </div>

      <div className="lg:col-span-3 lg:mt-0">
        <span className="rounded-full border border-outline-variant/10 bg-surface-container-highest/50 px-3 py-1 font-label text-[11px] text-on-surface-variant">
          {roleLabel}
        </span>
      </div>

      <div className="text-left text-xs text-on-surface-variant lg:col-span-2 lg:text-right">
        {formatHistoryCardDate(analysis.createdAt)}
      </div>

      <div className="text-right lg:col-span-2">
        <div className="flex flex-col items-end gap-1">
          <span className={`text-lg font-bold font-headline ${matchValueClassName}`}>
            {matchPercentage}
            <span className="ml-0.5 text-[10px] font-label opacity-60">%</span>
          </span>
          <div className="h-1 w-full lg:w-24 overflow-hidden rounded-full bg-surface-container-lowest">
            <div className={`h-full ${progressClassName}`} style={{ width: `${matchPercentage}%` }} />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex justify-end lg:col-span-1 lg:justify-end">
        <Button
          aria-label={`Eliminar ${companyLabel}`}
          className="opacity-100 transition-opacity focus:opacity-100 focus-visible:ring-2 focus-visible:ring-primary/40 lg:opacity-0 lg:group-hover:opacity-100"
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
