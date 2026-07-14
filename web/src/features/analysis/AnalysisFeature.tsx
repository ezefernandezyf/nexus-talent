import { AnimatedMount } from "@/shared/components/AnimatedMount";
import { Card } from "@/shared/components/Card";
import { useJobAnalysis } from "./hooks/useJobAnalysis";
import { JobDescriptionForm } from "./components/JobDescriptionForm";
import { AnalysisCard } from "./components/AnalysisCard";
import type { AnalysisPersistenceScope } from "./hooks/useAnalysisRepository";
import type { AnalysisRepository } from "./api/repository";

interface AnalysisFeatureProps {
  initialJobDescription?: string | null;
  initialPrefillKey?: string | null;
  repository?: AnalysisRepository;
  scope?: AnalysisPersistenceScope;
}

function LoadingState() {
  return (
    <div aria-label="Cargando análisis" className="animate-pulse space-y-6" role="status">
      {/* 5 numbered result section skeletons */}
      {[1, 2, 3, 4, 5].map((section) => (
        <div key={section} className="rounded-lg border border-border bg-surface p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-muted">
              <div className="h-5 w-5 rounded bg-surface-muted/60" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="h-6 w-48 rounded bg-surface-muted" />
              <div className="h-4 w-3/4 rounded bg-surface-muted/60" />
              <div className="h-4 w-1/2 rounded bg-surface-muted/60" />
              <div className="h-4 w-5/6 rounded bg-surface-muted/40" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error/10">
          <span className="material-symbols-outlined text-2xl text-error" aria-hidden="true">
            error_outline
          </span>
        </div>
        <div className="space-y-2">
          <h3 className="text-h3 text-text-primary">El análisis falló</h3>
          <p className="text-body text-text-secondary">{message}</p>
        </div>
      </div>
    </Card>
  );
}

function EmptyStateView() {
  return (
    <Card className="p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-muted">
          <span className="material-symbols-outlined text-2xl text-accent" aria-hidden="true">
            description
          </span>
        </div>
        <div className="space-y-2">
          <h3 className="text-h3 text-text-primary">No hay análisis todavía</h3>
          <p className="text-body text-text-secondary">
            Pegá una descripción del puesto para obtener un análisis completo.
          </p>
        </div>
      </div>
    </Card>
  );
}

function getAnimationKey(analysis: ReturnType<typeof useJobAnalysis>): string {
  if (analysis.isPending) return "loading";
  if (analysis.isError) return "error";
  if (analysis.data) return "content";
  return "idle";
}

export function AnalysisFeature({ initialJobDescription, initialPrefillKey, repository, scope }: AnalysisFeatureProps) {
  const analysis = useJobAnalysis({ repository, scope });
  const errorMessage = analysis.error instanceof Error ? analysis.error.message : "No se pudo completar el análisis.";

  return (
    <section id="analysis" className="flex flex-col gap-6">
      <JobDescriptionForm
        errorMessage={analysis.isError ? errorMessage : null}
        initialJobDescription={initialJobDescription}
        initialPrefillKey={initialPrefillKey}
        isPending={analysis.isPending}
        onSubmit={analysis.submitAnalysis}
      />

      <div className="min-h-[400px]">
        <AnimatedMount key={getAnimationKey(analysis)}>
          {analysis.isPending ? (
            <LoadingState />
          ) : analysis.isError ? (
            <ErrorState message={errorMessage} />
          ) : analysis.data ? (
            <AnalysisCard result={analysis.data} />
          ) : analysis.isIdle ? (
            <EmptyStateView />
          ) : null}
        </AnimatedMount>
      </div>
    </section>
  );
}
