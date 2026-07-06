import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "@phosphor-icons/react";
import { FeaturePageShell } from "@/shared/components";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
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
    <Card className="space-y-4">
      <h2 className="text-caption font-semibold">{title}</h2>
      {children}
    </Card>
  );
}

function ResultCard({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return (
    <Card>
      <div className="font-display font-black text-4xl text-text-primary/90">
        {number}
      </div>
      <h3 className="text-h3 mt-2">{title}</h3>
      <div className="mt-4 text-body text-text-secondary">
        {children}
      </div>
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
        <Card className="flex flex-col gap-4">
          <Badge>Historial</Badge>
          <h1 className="text-h2 text-text-primary">Análisis no encontrado</h1>
          <p className="text-body text-text-secondary">No encontramos ese guardado en el historial. Volvé al listado para abrir otro análisis.</p>
          <Link
            to="/app/history"
            className="inline-flex w-fit items-center gap-1.5 rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-all duration-200"
          >
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
  const reworkSearch = new URLSearchParams({ sourceHistoryId: analysis.id }).toString();
  const vacancy = analysis.vacancySummary;
  const summary = analysis.summary;
  const keywords = analysis.keywords;
  const outreach = analysis.outreachMessage;

  return (
    <FeaturePageShell>
      {/* Inline back link */}
      <Link
        to="/app/history"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft size={16} weight="regular" />
        Volver al historial
      </Link>

      {/* Detail meta */}
      <div className="mt-4 mb-8">
        <h1 className="text-h2 text-text-primary">Detalle del análisis</h1>
        <p className="text-body text-text-secondary mt-1">
          {displayLabel} · {roleLabel} · {formatHistoryCardDate(analysis.createdAt)} · {uidLabel}
        </p>
      </div>

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

        {/* 01 Summary */}
        {vacancy || summary ? (
          <ResultCard number="01" title="Summary">
            {vacancy ? (
              <div className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-3">
                  <div>
                    <span className="text-caption font-semibold">Rol</span>
                    <p>{vacancy.role}</p>
                  </div>
                  <div>
                    <span className="text-caption font-semibold">Seniority</span>
                    <p>{vacancy.seniority}</p>
                  </div>
                  <div>
                    <span className="text-caption font-semibold">Modalidad</span>
                    <p>{vacancy.modalityLocation}</p>
                  </div>
                </div>
                {vacancy.responsibilities.length > 0 && (
                  <div>
                    <span className="text-caption font-semibold">Responsabilidades</span>
                    <ul className="mt-1 list-disc pl-5 space-y-1">
                      {vacancy.responsibilities.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
            {summary && !vacancy ? (
              <p>{summary}</p>
            ) : null}
          </ResultCard>
        ) : null}

        {/* 02 Keywords */}
        {keywords ? (
          <ResultCard number="02" title="Keywords">
            <div className="space-y-4">
              {keywords.hardSkills.length > 0 && (
                <div>
                  <span className="text-caption font-semibold">Hard Skills</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {keywords.hardSkills.map((k) => (
                      <Badge key={k}>{k}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {keywords.softSkills.length > 0 && (
                <div>
                  <span className="text-caption font-semibold">Soft Skills</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {keywords.softSkills.map((k) => (
                      <Badge key={k}>{k}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {keywords.domainKeywords.length > 0 && (
                <div>
                  <span className="text-caption font-semibold">Dominio</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {keywords.domainKeywords.map((k) => (
                      <Badge key={k}>{k}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {keywords.atsTerms.length > 0 && (
                <div>
                  <span className="text-caption font-semibold">ATS Terms</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {keywords.atsTerms.map((k) => (
                      <Badge key={k}>{k}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ResultCard>
        ) : null}

        {/* 03 Outreach */}
        {outreach ? (
          <ResultCard number="03" title="Outreach">
            <div className="space-y-3">
              <div>
                <span className="text-caption font-semibold">Subject</span>
                <p className="mt-1">{outreach.subject}</p>
              </div>
              <div>
                <span className="text-caption font-semibold">Body</span>
                <div className="mt-1 whitespace-pre-wrap rounded-md bg-surface-muted p-4 font-mono text-sm leading-relaxed">
                  {outreach.body}
                </div>
              </div>
            </div>
          </ResultCard>
        ) : null}

        {analysis.githubEnrichment ? (
          <DetailSection title="GitHub">
            <div className="space-y-3 text-body text-text-secondary">
              <p>
                Repositorio:{" "}
                <a
                  className="text-[var(--accent)] transition-colors hover:opacity-80"
                  href={analysis.githubEnrichment.repositoryUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {analysis.githubEnrichment.repositoryName}
                </a>
              </p>
              <p>
                {analysis.githubEnrichment.warningMessage ??
                  "El enriquecimiento de GitHub se resolvió sin advertencias."}
              </p>
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
