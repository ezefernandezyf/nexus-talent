import { useJobAnalysis } from "./hooks/useJobAnalysis";
import { JobDescriptionForm } from "./components/JobDescriptionForm";
import { AnalysisCard } from "./components/AnalysisCard";
import type { AnalysisPersistenceScope } from "./hooks/useAnalysisRepository";
import type { AnalysisRepository } from "../../lib/repositories";

interface AnalysisFeatureProps {
  initialGithubRepositoryUrl?: string | null;
  initialJobDescription?: string | null;
  initialPrefillKey?: string | null;
  repository?: AnalysisRepository;
  scope?: AnalysisPersistenceScope;
}

function LoadingState() {
  return (
    <StatePanel label="Procesando" title="El análisis está en marcha" tone="loading">
      <div className="space-y-4">
        <div className="h-8 w-3/4 rounded-full bg-surface-bright animate-pulse" />
        <div className="h-5 w-full rounded-full bg-surface-bright/80 animate-pulse" />
        <div className="h-5 w-5/6 rounded-full bg-surface-bright/80 animate-pulse" />
      </div>
      <div className="rounded-2xl bg-surface-container-lowest/80 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
        <p className="text-sm leading-7 text-on-surface-variant">
          El analizador determinista está dando forma ahora al resumen, a los grupos de señales y al borrador del mensaje.
        </p>
      </div>
    </StatePanel>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <StatePanel label="El análisis falló" title="No se pudo completar la lectura" tone="error">
      <p className="text-base leading-7 text-on-surface-variant">{message}</p>
    </StatePanel>
  );
}

export function StatePanel({
  children,
  label,
  title,
  tone,
  compact = false,
}: {
  children: React.ReactNode;
  label: string;
  title: string;
  tone: "loading" | "empty" | "error";
  compact?: boolean;
}) {
  return (
    <div className={compact ? "surface-panel flex flex-col gap-5 p-6 sm:p-8" : "surface-panel flex min-h-136 flex-col gap-6 p-6 sm:p-8"}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="label-chip">{label}</span>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">{title}</h3>
        </div>
        <span
          className={
            tone === "error"
              ? "rounded-full bg-error/10 px-3 py-1 text-xs font-medium text-error"
              : tone === "loading"
                ? "rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                : "rounded-full bg-surface-container-high/70 px-3 py-1 text-xs font-medium text-on-surface-variant"
          }
        >
          {tone === "loading" ? "En curso" : tone === "error" ? "Revisar" : "Vacío"}
        </span>
      </div>

      <div className={compact ? "flex flex-col gap-4" : "flex flex-1 flex-col justify-between gap-6"}>{children}</div>
    </div>
  );
}

export function AnalysisFeature({ initialGithubRepositoryUrl, initialJobDescription, initialPrefillKey, repository, scope }: AnalysisFeatureProps) {
  const analysis = useJobAnalysis({ repository, scope });
  const errorMessage = analysis.error instanceof Error ? analysis.error.message : "No se pudo completar el análisis.";

  return (
    <section id="analysis" className="flex flex-col gap-6">
      <JobDescriptionForm
        errorMessage={analysis.isError ? errorMessage : null}
        initialGithubRepositoryUrl={initialGithubRepositoryUrl}
        initialJobDescription={initialJobDescription}
        initialPrefillKey={initialPrefillKey}
        isPending={analysis.isPending}
        onSubmit={analysis.submitAnalysis}
      />

      {analysis.isPending ? (
        <LoadingState />
      ) : analysis.isError ? (
        <ErrorState message={errorMessage} />
      ) : analysis.data ? (
        <AnalysisCard result={analysis.data} />
      ) : (
        null
      )}
    </section>
  );
}