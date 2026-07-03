import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { FeaturePageShell, PageHeader } from "@/shared/components";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { cn } from "@/shared/utils/cn";
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

const linkBtnPrimary = cn(
  "inline-flex items-center justify-center rounded-full font-label select-none",
  "transition-all duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
  "bg-[var(--color-brand)] text-[var(--color-on-brand)]",
  "hover:brightness-105 hover:-translate-y-0.5 active:scale-[0.97]",
  "h-10 px-4 text-label text-base gap-2",
);

const linkBtnSecondary = cn(
  "inline-flex items-center justify-center rounded-full font-label select-none",
  "transition-all duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
  "bg-[var(--color-accent)] text-[var(--color-on-accent)]",
  "hover:brightness-105 hover:-translate-y-0.5 active:scale-[0.97]",
  "h-10 px-4 text-label text-base gap-2",
);

function DetailSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <Card variant="flat" className="space-y-4 p-6 sm:p-8">
      <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant">{title}</h2>
      {children}
    </Card>
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
        <HistoryDetailPageSkeleton />
      </FeaturePageShell>
    );
  }

  if (!historyQuery.analysis) {
    return (
      <FeaturePageShell>
        <Card variant="flat" className="flex flex-col gap-4 p-6 sm:p-8">
          <Badge variant="neutral" size="sm">Historial</Badge>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white">Análisis no encontrado</h1>
          <p className="text-base leading-7 text-on-surface-variant">No encontramos ese guardado en el historial. Volvé al listado para abrir otro análisis.</p>
          <Link className={cn(linkBtnPrimary, "w-fit")} to="/app/history">
            Volver al historial
          </Link>
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
            <Link
              className={cn(linkBtnSecondary, "w-full justify-center sm:w-auto")}
              state={reworkState}
              to={{ pathname: "/app/analysis", search: `?${reworkSearch}` }}
            >
              Rework desde este guardado
            </Link>
            <Link className={cn(linkBtnSecondary, "w-full justify-center sm:w-auto")} to="/app/history">
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
                    <Badge key={`${signal.name}-${signal.source}`} variant="brand" size="sm">
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