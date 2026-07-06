import { useCallback, useState } from "react";
import type { AnalysisRepository } from "@/features/analysis/api/repository";
import { useAnalysisHistory } from "@/features/analysis";
import { HistoryEmptyState, HistoryList, HistoryLoadingState } from "./components";
import { Badge } from "@/shared/components/Badge";
import type { AnalysisPersistenceScope } from "@/features/analysis/hooks/useAnalysisRepository";

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

const PAGE_SIZE = 10;

export function HistoryFeature({ analysisHref = "/app/analysis", repository, scope }: HistoryFeatureProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const history = useAnalysisHistory({
    repository,
    scope,
    page: { page: currentPage, limit: PAGE_SIZE },
  });
  const errorMessage = getHistoryErrorMessage(history.error);
  const totalPages = Math.max(1, Math.ceil(history.total / PAGE_SIZE));

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
    },
    [],
  );

  return (
    <section className="flex flex-col gap-6">
      {history.isPending ? (
        <HistoryLoadingState />
      ) : history.isError ? (
        <div className="rounded-lg border border-border bg-surface p-8 text-center" role="alert">
          <div className="mx-auto max-w-xl space-y-3">
            <Badge>No se pudo cargar el historial</Badge>
            <p className="text-body text-text-secondary">{errorMessage}</p>
          </div>
        </div>
      ) : history.analyses.length === 0 ? (
        <HistoryEmptyState analysisHref={analysisHref} />
      ) : (
        <HistoryList
          analyses={history.analyses}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalPages={totalPages}
        />
      )}
    </section>
  );
}
