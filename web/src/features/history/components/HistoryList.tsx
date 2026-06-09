import type { SavedJobAnalysis } from "../../../schemas/job-analysis";
import { HistoryCard } from "./HistoryCard";

interface HistoryListProps {
  analyses: SavedJobAnalysis[];
  currentPage: number;
  isDeletingId?: string | null;
  onDelete: (analysisId: string) => void;
  onPageChange: (page: number) => void;
  totalPages: number;
}

export function HistoryList({ analyses, currentPage, isDeletingId, onDelete, onPageChange, totalPages }: HistoryListProps) {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="space-y-2.5 sm:space-y-3" aria-label="Historial de análisis" role="list">
      <div className="hidden grid-cols-1 px-4 py-2 text-[10px] font-label uppercase tracking-widest text-on-surface-variant/50 lg:grid lg:grid-cols-12">
        <div className="lg:col-span-4">Compañía / ID</div>
        <div className="lg:col-span-4">Rol Aplicado</div>
        <div className="lg:col-span-2">Fecha</div>
        <div className="text-right lg:col-span-2">Acciones</div>
      </div>

      {analyses.map((analysis, index) => (
        <HistoryCard
          analysis={analysis}
          iconName={["apartment", "rocket_launch", "account_balance", "view_in_ar"][index % 4]}
          isDeleting={isDeletingId === analysis.id}
          key={analysis.id}
          onDelete={onDelete}
        />
      ))}

      <div className="mt-6 flex flex-col gap-3 border-t border-outline-variant/15 pt-4 sm:mt-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/40">Página {currentPage} de {totalPages}</p>
          <p className="text-sm leading-6 text-on-surface-variant">Mostrando {analyses.length} ejecuciones en esta página.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            aria-label="Página anterior"
            className="flex h-10 items-center justify-center rounded-lg border border-outline-variant/20 px-3 text-sm text-on-surface-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            disabled={!canGoPrevious}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <span aria-hidden="true" className="material-symbols-outlined text-sm">
              arrow_back_ios
            </span>
          </button>
          <span className="rounded-lg bg-surface-container-low/50 px-3 py-2 font-label text-sm text-on-surface-variant">
            {currentPage} / {totalPages}
          </span>
          <button
            aria-label="Página siguiente"
            className="flex h-10 items-center justify-center rounded-lg border border-outline-variant/20 px-3 text-sm text-on-surface-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            disabled={!canGoNext}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <span aria-hidden="true" className="material-symbols-outlined text-sm">
              arrow_forward_ios
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
