import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { FeaturePageShell, PageHeader } from "../components/ui";
import { AnalysisResultView } from "../features/analysis/components/AnalysisResultView";
import { useAnalysisRepository } from "../features/analysis/hooks/useAnalysisRepository";
import { useAnalysisById } from "../features/analysis/hooks/useAnalysisById";
import { HistoryDetailEditor } from "../features/history/components";
import { useUpdateAnalysis } from "../features/history/hooks";
import {
  formatHistoryCardDate,
  getHistoryCompanyLabel,
  getHistoryRoleLabel,
  getHistoryUid,
} from "../features/history/history-formatters";

function DetailSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="surface-panel space-y-4 p-6 sm:p-8">
      <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant">{title}</h2>
      {children}
    </section>
  );
}

export function HistoryDetailPage() {
  const { analysisId } = useParams<{ analysisId: string }>();
  const { repository, scope } = useAnalysisRepository();
  const historyQuery = useAnalysisById(analysisId, { repository, scope });
  const updateMutation = useUpdateAnalysis({ repository, scope });

  if (historyQuery.isPending) {
    return (
      <FeaturePageShell>
        <div className="surface-panel p-6 text-on-surface-variant">Cargando el detalle guardado...</div>
      </FeaturePageShell>
    );
  }

  if (!historyQuery.analysis) {
    return (
      <FeaturePageShell>
        <div className="surface-panel flex flex-col gap-4 p-6 sm:p-8">
          <span className="label-chip">Historial</span>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white">Análisis no encontrado</h1>
          <p className="text-base leading-7 text-on-surface-variant">No encontramos ese guardado en el historial. Volvé al listado para abrir otro análisis.</p>
          <Link className="primary-button w-fit" to="/app/history">
            Volver al historial
          </Link>
        </div>
      </FeaturePageShell>
    );
  }

  const analysis = historyQuery.analysis;
  const displayLabel = getHistoryCompanyLabel(analysis);
  const roleLabel = getHistoryRoleLabel(analysis);
  const uidLabel = getHistoryUid(analysis);
  const reworkState = {
    githubRepositoryUrl: analysis.githubEnrichment?.repositoryUrl ?? undefined,
    jobDescription: analysis.jobDescription,
    sourceHistoryId: analysis.id,
  };
  const reworkSearch = new URLSearchParams({ sourceHistoryId: analysis.id }).toString();

  return (
    <FeaturePageShell>
      <PageHeader
        action={
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              className="secondary-button w-full justify-center sm:w-auto"
              state={reworkState}
              to={{ pathname: "/app/analysis", search: `?${reworkSearch}` }}
            >
              Rework desde este guardado
            </Link>
            <Link className="secondary-button w-full justify-center sm:w-auto" to="/app/history">
              Volver al historial
            </Link>
          </div>
        }
        description={`${displayLabel} · ${roleLabel} · ${formatHistoryCardDate(analysis.createdAt)} · ${uidLabel}`}
        title="Detalle del análisis"
      />

      <div className="grid gap-6">
        <HistoryDetailEditor
          analysis={analysis}
          errorMessage={updateMutation.error?.message ?? null}
          isLoading={historyQuery.isPending}
          isPending={updateMutation.isPending}
          successMessage={updateMutation.isSuccess ? "Cambios guardados correctamente." : null}
          onSubmit={async (payload) => {
            await updateMutation.updateAnalysisAsync({
              analysisId: analysis.id,
              patch: {
                displayName: payload.displayName,
                notes: payload.notes,
              },
            });
          }}
        />

        <AnalysisResultView result={analysis} />

        {analysis.githubEnrichment ? (
          <DetailSection title="GitHub">
            <div className="space-y-3 text-sm leading-7 text-on-surface-variant">
              <p>
                Repositorio: <a className="text-primary transition-colors hover:opacity-80" href={analysis.githubEnrichment.repositoryUrl} rel="noreferrer" target="_blank">{analysis.githubEnrichment.repositoryName}</a>
              </p>
              <p>{analysis.githubEnrichment.warningMessage ?? "El enriquecimiento de GitHub se resolvió sin advertencias."}</p>
              {analysis.githubEnrichment.detectedStack.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.githubEnrichment.detectedStack.map((signal) => (
                    <span key={`${signal.name}-${signal.source}`} className="tech-chip">
                      {signal.name}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </DetailSection>
        ) : null}
      </div>
    </FeaturePageShell>
  );
}