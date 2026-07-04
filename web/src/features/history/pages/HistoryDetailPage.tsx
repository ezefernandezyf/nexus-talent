import type { ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FeaturePageShell, PageHeader } from "@/shared/components";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { AnalysisResultView } from "@/features/analysis/components/AnalysisResultView";
import { HistoryDetailPageSkeleton } from "@/features/history/components/HistoryDetailPageSkeleton";
import { useAnalysisRepository } from "@/features/analysis/hooks/useAnalysisRepository";
import { useAnalysisById } from "@/features/analysis/hooks/useAnalysisById";
import { HistoryDetailEditor } from "@/features/history/components";
import { useUpdateAnalysis } from "@/features/history/hooks";
import {
  formatHistoryCardDate,
  getHistoryCompanyLabel,
  getHistoryRoleLabel,
  getHistoryUid,
} from "@/features/history/history-formatters";

function DetailSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <Card className="space-y-4 p-6 sm:p-8">
      <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant">{title}</h2>
      {children}
    </Card>
  );
}

export function HistoryDetailPage() {
  const { analysisId } = useParams<{ analysisId: string }>();
  const { repository, scope } = useAnalysisRepository();
  const navigate = useNavigate();
  const historyQuery = useAnalysisById(analysisId, { repository, scope });
  const updateMutation = useUpdateAnalysis({ repository, scope });

  if (historyQuery.isPending) {
    return (
      <FeaturePageShell>
        <HistoryDetailPageSkeleton />
      </FeaturePageShell>
    );
  }

  if (!historyQuery.analysis) {
    return (
      <FeaturePageShell>
        <Card className="flex flex-col gap-4 p-6 sm:p-8">
          <Badge>Historial</Badge>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">Análisis no encontrado</h1>
          <p className="text-base leading-7 text-on-surface-variant">No encontramos ese guardado en el historial. Volvé al listado para abrir otro análisis.</p>
          <Button className="w-fit" variant="filled" type="button" onClick={() => navigate("/app/history")}>
            Volver al historial
          </Button>
        </Card>
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
            <Button
              className="w-full justify-center sm:w-auto"
              variant="outline"
              type="button"
              onClick={() => navigate(`/app/analysis?${reworkSearch}`, { state: reworkState })}
            >
              Rework desde este guardado
            </Button>
            <Button
              className="w-full justify-center sm:w-auto"
              variant="outline"
              type="button"
              onClick={() => navigate("/app/history")}
            >
              Volver al historial
            </Button>
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
                Repositorio: <a className="text-[var(--accent)] transition-colors hover:opacity-80" href={analysis.githubEnrichment.repositoryUrl} rel="noreferrer" target="_blank">{analysis.githubEnrichment.repositoryName}</a>
              </p>
              <p>{analysis.githubEnrichment.warningMessage ?? "El enriquecimiento de GitHub se resolvió sin advertencias."}</p>
              {analysis.githubEnrichment.detectedStack.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.githubEnrichment.detectedStack.map((signal) => (
                    <Badge key={`${signal.name}-${signal.source}`}>
                      {signal.name}
                    </Badge>
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