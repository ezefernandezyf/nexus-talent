import type { AnalysisRepository } from "../../lib/repositories";
import { useAnalysisHistory } from "../analysis";
import { Card } from "../../components/ui/Card";
import { HistoryCard, HistoryEmptyState, HistoryLoadingState } from "./components";
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

  function handleDelete(analysisId: string) {
    deleteMutation.deleteAnalysis(analysisId);
  }

  return (
    <Card className="flex flex-col gap-6 p-6 sm:p-8">
      {deleteMutation.error ? (
        <p className="text-sm leading-6 text-error" role="alert">
          {deleteMutation.error.message}
        </p>
      ) : null}

      {history.isPending ? (
        <HistoryLoadingState />
      ) : history.isError ? (
        <div className="rounded-3xl bg-surface-container-lowest/50 p-8 text-center sm:p-12" role="alert">
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
    </Card>
  );
}