import type { SavedJobAnalysis } from "../../../schemas/job-analysis";
import { HistoryCard } from "./HistoryCard";

interface HistoryListProps {
  analyses: SavedJobAnalysis[];
  isDeletingId?: string | null;
  onDelete: (analysisId: string) => void;
  totalPages: number;
  visibleCount: number;
}

export function HistoryList({ analyses, isDeletingId, onDelete, totalPages, visibleCount }: HistoryListProps) {
  return (
    <div className="space-y-2.5 sm:space-y-3" aria-label="Historial de análisis" role="list">
      <div className="hidden grid-cols-1 px-4 py-2 text-[10px] font-label uppercase tracking-widest text-on-surface-variant/50 lg:grid">
        <div className="lg:col-span-4">Compañía / ID</div>
        <div className="lg:col-span-3">Rol Aplicado</div>
        <div className="lg:col-span-2">Fecha</div>
        <div className="text-right lg:col-span-3">Compatibilidad</div>
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
        <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/40">
          Mostrando {visibleCount} de {analyses.length} Ejecuciones
        </p>
        <div className="hidden gap-2 lg:flex">
          <button aria-label="Página anterior" className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant/20 text-on-surface-variant transition-colors hover:bg-surface-container" type="button">
            <span aria-hidden="true" className="material-symbols-outlined text-sm">
              arrow_back_ios
            </span>
          </button>
          <button aria-current="page" aria-label="Ir a la página 1" className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-surface-container font-label text-sm text-primary" type="button">
            1
          </button>
          <button aria-label="Ir a la página 2" className="flex h-10 w-10 items-center justify-center rounded-lg font-label text-sm text-on-surface-variant transition-colors hover:bg-surface-container" type="button">
            2
          </button>
          <button aria-label="Ir a la página 3" className="flex h-10 w-10 items-center justify-center rounded-lg font-label text-sm text-on-surface-variant transition-colors hover:bg-surface-container" type="button">
            3
          </button>
          <button aria-label="Página siguiente" className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant/20 text-on-surface-variant transition-colors hover:bg-surface-container" type="button">
            <span aria-hidden="true" className="material-symbols-outlined text-sm">
              arrow_forward_ios
            </span>
          </button>
        </div>
        <div className="flex items-center lg:hidden">
          <p className="font-label text-sm text-on-surface-variant">Página 1 / {totalPages}</p>
        </div>
      </div>
    </div>
  );
}
