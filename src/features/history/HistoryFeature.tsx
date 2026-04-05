import type { AnalysisRepository } from "../../lib/repositories";
import { useAnalysisHistory } from "../analysis";
import { HistoryCard, HistoryEmptyState, HistoryLoadingState } from "./components";
import { useDeleteAnalysis } from "./hooks";

interface HistoryFeatureProps {
  analysisHref?: string;
  repository?: AnalysisRepository;
}

function getHistoryErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "No se pudo cargar el historial.";
}

export function HistoryFeature({ analysisHref = "#analysis", repository }: HistoryFeatureProps) {
  const history = useAnalysisHistory({ repository });
  const deleteMutation = useDeleteAnalysis({ repository });
  const errorMessage = getHistoryErrorMessage(history.error);

  function handleDelete(analysisId: string) {
    deleteMutation.deleteAnalysis(analysisId);
  }

  return (
    <section className="surface-panel flex flex-col gap-6 p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <span className="label-chip">Historial persistido</span>
          <h2 className="max-w-2xl text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
            Revisitá análisis anteriores sin perder el foco del flujo principal.
          </h2>
          <p className="max-w-2xl text-base leading-7 text-on-surface-variant">
            Cada guardado queda disponible para volver a leer la síntesis ejecutiva, las señales técnicas y los mensajes sugeridos.
          </p>
        </div>

        <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-on-surface-variant">
          {history.analyses.length} guardados
        </span>
      </div>

      {deleteMutation.error ? (
        <p className="text-sm leading-6 text-error" role="alert">
          {deleteMutation.error.message}
        </p>
      ) : null}

      {history.isPending ? (
        <HistoryLoadingState />
      ) : history.isError ? (
        <div className="rounded-[1.5rem] bg-surface-container-lowest/50 p-8 text-center sm:p-12" role="alert">
          <div className="mx-auto max-w-xl space-y-3">
            <span className="label-chip">No se pudo cargar el historial</span>
            <p className="text-base leading-7 text-on-surface-variant">{errorMessage}</p>
          </div>
        </div>
      ) : history.analyses.length === 0 ? (
        <HistoryEmptyState analysisHref={analysisHref} />
      ) : (
        <div className="space-y-4" role="list" aria-label="Historial de análisis">
          {history.analyses.map((analysis) => (
            <HistoryCard
              key={analysis.id}
              analysis={analysis}
              isDeleting={deleteMutation.isPending && deleteMutation.variables === analysis.id}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}