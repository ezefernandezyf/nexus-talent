import { AnalysisFeature } from "../features/analysis";
import { useAnalysisById } from "../features/analysis/hooks/useAnalysisById";
import { useAnalysisRepository } from "../features/analysis/hooks/useAnalysisRepository";
import { FeaturePageShell, PageHeader } from "../components/ui";
import { useLocation, useSearchParams } from "react-router-dom";

type AnalysisReworkState = {
  githubRepositoryUrl?: string;
  jobDescription?: string;
  sourceHistoryId?: string;
};

export function AnalysisPage() {
  const { repository, scope } = useAnalysisRepository();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const reworkState = location.state as AnalysisReworkState | null;
  const sourceHistoryId = reworkState?.sourceHistoryId ?? searchParams.get("sourceHistoryId") ?? undefined;
  const historyQuery = useAnalysisById(sourceHistoryId, { repository, scope });

  const prefillJobDescription = reworkState?.jobDescription ?? historyQuery.analysis?.jobDescription ?? null;
  const prefillGithubRepositoryUrl = reworkState?.githubRepositoryUrl ?? historyQuery.analysis?.githubEnrichment?.repositoryUrl ?? null;
  const initialPrefillKey = sourceHistoryId ?? (prefillJobDescription ? prefillJobDescription : null);

  return (
    <FeaturePageShell>
        <PageHeader
          description="Optimiza tu perfil para la vacante deseada utilizando nuestro motor de inteligencia artificial."
          title="Nuevo Análisis de Reclutamiento"
        />

        <AnalysisFeature
          initialGithubRepositoryUrl={prefillGithubRepositoryUrl}
          initialJobDescription={prefillJobDescription}
          initialPrefillKey={initialPrefillKey}
          repository={repository}
          scope={scope}
        />

        <section className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          <article className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-high text-primary">
              <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                psychology
              </span>
            </div>
            <div>
              <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-on-surface">Keywords</h3>
              <p className="text-[11px] leading-relaxed text-on-surface-variant">Extracción automática de habilidades clave y requisitos técnicos.</p>
            </div>
          </article>
          <article className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-high text-primary">
              <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                draw
              </span>
            </div>
            <div>
              <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-on-surface">Drafting</h3>
              <p className="text-[11px] leading-relaxed text-on-surface-variant">Generación de cartas de presentación adaptadas al rol.</p>
            </div>
          </article>
          <article className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-high text-primary">
              <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                query_stats
              </span>
            </div>
            <div>
              <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-on-surface">Gap Analysis</h3>
              <p className="text-[11px] leading-relaxed text-on-surface-variant">Identificación de brechas entre tu CV y la descripción.</p>
            </div>
          </article>
        </section>
    </FeaturePageShell>
  );
}
