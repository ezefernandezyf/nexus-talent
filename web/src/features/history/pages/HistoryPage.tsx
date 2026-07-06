import { useAnalysisRepository } from "@/features/analysis/hooks/useAnalysisRepository";
import { FeaturePageShell, PageHeader } from "@/shared/components";
import { HistoryFeature } from "..";

export function HistoryPage() {
  const { repository, scope } = useAnalysisRepository();

  return (
    <FeaturePageShell>
      <PageHeader
        description="Registro local de vacantes analizadas para revisar el detalle o reabrir un guardado."
        title="Historial de Análisis"
      />

      <HistoryFeature repository={repository} scope={scope} />
    </FeaturePageShell>
  );
}
