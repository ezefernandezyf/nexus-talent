import type { SavedJobAnalysis } from "@/features/analysis/schemas/job-analysis";
import { Button } from "@/shared/components/Button";
import { HistoryCard } from "./HistoryCard";

interface HistoryListProps {
  analyses: SavedJobAnalysis[];
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
}

export function HistoryList({ analyses, currentPage, onPageChange, totalPages }: HistoryListProps) {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="space-y-3" aria-label="Historial de análisis" role="list">
      {analyses.map((analysis) => (
        <div key={analysis.id} role="listitem">
          <HistoryCard analysis={analysis} />
        </div>
      ))}

      {/* Pagination — preserved, editorial-styled */}
      <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-secondary">
          Página {currentPage} de {totalPages} &middot; {analyses.length} ejecuciones
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!canGoPrevious}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Página anterior"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-sm">
              arrow_back_ios
            </span>
            Anterior
          </Button>
          <span className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text-secondary">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!canGoNext}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Página siguiente"
          >
            Siguiente
            <span aria-hidden="true" className="material-symbols-outlined text-sm">
              arrow_forward_ios
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
