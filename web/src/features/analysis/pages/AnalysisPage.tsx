import { AnalysisFeature } from "..";
import { useAnalysisById } from "@/features/analysis/hooks/useAnalysisById";
import { useAnalysisRepository } from "@/features/analysis/hooks/useAnalysisRepository";
import { Card, FeaturePageShell, PageHeader } from "@/shared/components";
import { useLocation, useSearchParams } from "react-router-dom";

type AnalysisReworkState = {
  githubRepositoryUrl?: string;
  jobDescription?: string;
  sourceHistoryId?: string;
};

const INFO_ITEMS = [
  {
    icon: "psychology",
    title: "Keywords",
    description: "Extracción automática de habilidades clave y requisitos técnicos.",
  },
  {
    icon: "draw",
    title: "Drafting",
    description:
      "Generación de cartas de presentación adaptadas al rol. LinkedIn solo se usa como referencia manual, no como fuente automatizada.",
  },
  {
    icon: "query_stats",
    title: "Gap Analysis",
    description: "Identificación de brechas entre tu CV y la descripción del puesto.",
  },
] as const;

export function AnalysisPage() {
  const { repository, scope } = useAnalysisRepository();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const reworkState = location.state as AnalysisReworkState | null;
  const sourceHistoryId =
    reworkState?.sourceHistoryId ?? searchParams.get("sourceHistoryId") ?? undefined;
  const historyQuery = useAnalysisById(sourceHistoryId, { repository, scope });

  const prefillJobDescription =
    reworkState?.jobDescription ?? historyQuery.analysis?.jobDescription ?? null;
  const prefillGithubRepositoryUrl =
    reworkState?.githubRepositoryUrl ??
    historyQuery.analysis?.githubEnrichment?.repositoryUrl ??
    null;
  const initialPrefillKey =
    sourceHistoryId ?? (prefillJobDescription ? prefillJobDescription : null);

  return (
    <FeaturePageShell>
      <PageHeader
        description="Optimiza tu perfil para la vacante deseada utilizando nuestro motor de inteligencia artificial. GitHub es el único enriquecimiento automatizado; LinkedIn queda como referencia manual por restricciones de la plataforma."
        title={
          <span className="font-display">
            Análisis de Reclutamiento
          </span>
        }
      />

      <AnalysisFeature
        initialGithubRepositoryUrl={prefillGithubRepositoryUrl}
        initialJobDescription={prefillJobDescription}
        initialPrefillKey={initialPrefillKey}
        repository={repository}
        scope={scope}
      />

      <section className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
        {INFO_ITEMS.map((item) => (
          <Card key={item.title} padding="lg" className="gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-brand-container)] text-[var(--accent)]">
              <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                {item.icon}
              </span>
            </div>
            <div>
              <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-on-surface font-display">
                {item.title}
              </h3>
              <p className="text-[11px] leading-relaxed text-on-surface-variant">
                {item.description}
              </p>
            </div>
          </Card>
        ))}
      </section>
    </FeaturePageShell>
  );
}
