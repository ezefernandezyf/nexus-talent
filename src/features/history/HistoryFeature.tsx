import type { AnalysisRepository } from "../../lib/repositories";
import { useAnalysisHistory } from "../analysis";
import { HistoryEmptyState, HistoryList, HistoryLoadingState } from "./components";
import { useDeleteAnalysis } from "./hooks";
import type { AnalysisPersistenceScope } from "../analysis/hooks/useAnalysisRepository";

interface HistoryFeatureProps {
  analysisHref?: string;
  repository?: AnalysisRepository;
  scope?: AnalysisPersistenceScope;
}

function getHistoryErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "No se pudo cargar el historial.";
}

export function HistoryFeature({ analysisHref = "/app/analysis", repository, scope }: HistoryFeatureProps) {
  const history = useAnalysisHistory({ repository, scope });
  const deleteMutation = useDeleteAnalysis({ repository, scope });
  const errorMessage = getHistoryErrorMessage(history.error);
  const visibleCount = Math.min(4, history.analyses.length);
  const totalPages = Math.max(1, Math.ceil(history.analyses.length / 4));

  function handleDelete(analysisId: string) {
    deleteMutation.deleteAnalysis(analysisId);
  }

  return (
    <section className="flex flex-col gap-3">
      {deleteMutation.error ? (
        <p className="text-sm leading-6 text-error" role="alert">
          {deleteMutation.error.message}
        </p>
      ) : null}

      {history.isPending ? (
        <HistoryLoadingState />
      ) : history.isError ? (
        <div className="rounded-xl bg-surface-container-low/40 p-6 text-center lg:p-10" role="alert">
          <div className="mx-auto max-w-xl space-y-3">
            <span className="label-chip">No se pudo cargar el historial</span>
            <p className="text-base leading-7 text-on-surface-variant">{errorMessage}</p>
          </div>
        </div>
      ) : history.analyses.length === 0 ? (
        <HistoryEmptyState analysisHref={analysisHref} />
      ) : (
        <HistoryList
          analyses={history.analyses}
          isDeletingId={deleteMutation.isPending ? deleteMutation.variables ?? null : null}
          onDelete={handleDelete}
          totalPages={totalPages}
          visibleCount={visibleCount}
        />
      )}
    </section>
  );
}