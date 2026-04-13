import { Link } from "react-router-dom";
import { HistoryFeature } from "../features/history";
import { useAnalysisRepository } from "../features/analysis/hooks/useAnalysisRepository";
import { FeaturePageShell, PageHeader } from "../components/ui";

export function HistoryPage() {
  const { repository, scope } = useAnalysisRepository();

  return (
    <FeaturePageShell>
      <PageHeader
        action={
          <button className="secondary-button flex items-center gap-2" type="button">
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
