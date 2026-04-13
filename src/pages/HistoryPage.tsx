import { useCallback } from "react";
import { Link } from "react-router-dom";
import { useAnalysisHistory } from "../features/analysis";
import { HistoryFeature } from "../features/history";
import { buildHistoryExportPayload } from "../features/history/history-export";
import { useAnalysisRepository } from "../features/analysis/hooks/useAnalysisRepository";
import { FeaturePageShell, PageHeader } from "../components/ui";
import { downloadTextFile } from "../features/analysis/export";

export function HistoryPage() {
  const { repository, scope } = useAnalysisRepository();
  const history = useAnalysisHistory({ repository, scope });

  const handleExport = useCallback(() => {
    const exportPayload = buildHistoryExportPayload(history.analyses);

    downloadTextFile({
      content: exportPayload.content,
      filename: exportPayload.filename,
      mimeType: "application/json;charset=utf-8",
    });
  }, [history.analyses]);

  return (
    <FeaturePageShell>
      <PageHeader
        action={
          <button className="secondary-button flex items-center gap-2" type="button" onClick={handleExport} disabled={history.isPending}>
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              download
            </span>
            EXPORTAR DATOS
          </button>
        }
        description="Registro completo de evaluaciones y métricas de compatibilidad técnica."
        title="Historial de Análisis"
      />

      <HistoryFeature repository={repository} scope={scope} />

      <Link
        aria-label="Nuevo análisis"
        className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary-container text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        to="/app/analysis"
      >
        <span className="material-symbols-outlined text-2xl" aria-hidden="true">
          add
        </span>
      </Link>
    </FeaturePageShell>
  );
}
