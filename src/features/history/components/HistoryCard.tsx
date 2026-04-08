import type { SavedJobAnalysis } from "../../../schemas/job-analysis";
import { Button } from "../../../components/ui/Button";
import {
  formatHistoryCardDate,
  getHistoryCardTitle,
  getHistorySummarySnippet,
  getTopHistorySkills,
} from "../history-formatters";

interface HistoryCardProps {
  analysis: SavedJobAnalysis;
  isDeleting?: boolean;
  onDelete: (analysisId: string) => void;
}

export function HistoryCard({ analysis, isDeleting = false, onDelete }: HistoryCardProps) {
  const title = getHistoryCardTitle(analysis);
  const summary = getHistorySummarySnippet(analysis.summary);
  const skills = getTopHistorySkills(analysis);

  return (
    <article className="surface-panel flex flex-col gap-5 p-5 sm:p-6" aria-label={title} role="listitem">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <span className="label-chip">Guardado</span>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl">{title}</h3>
            <p className="text-sm uppercase tracking-[0.22em] text-on-surface-variant">
              {formatHistoryCardDate(analysis.createdAt)}
            </p>
          </div>
        </div>

        <Button variant="secondary" className="shrink-0" type="button" onClick={() => onDelete(analysis.id)} disabled={isDeleting}>
          {isDeleting ? "Eliminando..." : "Eliminar"}
        </Button>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant">Resumen ejecutivo</h4>
        <p className="text-sm leading-7 text-on-surface sm:text-base">{summary}</p>
      </div>

      {skills.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant">Skills clave</h4>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill} className="tech-chip bg-surface-container-high text-[0.76rem]">
                {skill}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}