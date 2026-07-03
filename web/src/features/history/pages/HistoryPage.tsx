import { useCallback } from "react";
import { Link } from "react-router-dom";
import { useAnalysisHistory } from "@/features/analysis";
import { HistoryFeature } from "..";
import { buildHistoryExportPayload } from "@/features/history/history-export";
import { useAnalysisRepository } from "@/features/analysis/hooks/useAnalysisRepository";
import { FeaturePageShell, PageHeader } from "@/shared/components";
import { Button } from "@/shared/components/Button";
import { downloadTextFile } from "@/features/analysis/export";

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
          <Button variant="secondary" className="flex items-center gap-2" type="button" onClick={handleExport} disabled={history.isPending}>
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              download
            </span>
            EXPORTAR DATOS
          </Button>
        }
        description="Registro local de vacantes analizadas para revisar el detalle, reabrir un guardado o exportar el historial completo."
        title="Historial de Análisis"
      />

      <HistoryFeature repository={repository} scope={scope} />

      <Link
        aria-label="Nuevo análisis"
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary-container text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 sm:bottom-8 sm:right-8 sm:h-14 sm:w-14"
        to="/app/analysis"
      >
        <span className="material-symbols-outlined text-2xl" aria-hidden="true">
          add
        </span>
      </Link>
    </FeaturePageShell>
  );
}
