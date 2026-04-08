import { useJobAnalysis } from "./hooks/useJobAnalysis";
import { JobDescriptionForm } from "./components/JobDescriptionForm";
import { AnalysisResultView } from "./components/AnalysisResultView";
import { Card } from "../../components/ui/Card";

function LoadingState() {
  return (
    <Card className="flex min-h-112 flex-col justify-between gap-6 p-6">
      <div className="space-y-4">
        <span className="label-chip">Procesando</span>
        <div className="space-y-3">
          <div className="h-8 w-3/4 rounded-full bg-surface-bright animate-pulse" />
          <div className="h-5 w-full rounded-full bg-surface-bright/80 animate-pulse" />
          <div className="h-5 w-5/6 rounded-full bg-surface-bright/80 animate-pulse" />
        </div>
      </div>
      <div className="ghost-frame rounded-2xl bg-surface-container-lowest/80 p-4">
        <p className="text-sm leading-7 text-on-surface-variant">
          El analizador determinista está dando forma ahora al resumen, a los grupos de señales y al borrador del mensaje.
        </p>
      </div>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="flex min-h-112 items-center justify-center p-6 text-center">
      <div className="max-w-sm space-y-3">
        <span className="label-chip">Listo cuando vos lo estés</span>
        <p className="text-base leading-7 text-on-surface-variant">
          Pegá una descripción del puesto y ejecutá el análisis para generar el resumen, la matriz de habilidades y el borrador editable del mensaje.
        </p>
      </div>
    </Card>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="flex min-h-112 items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-3">
        <span className="label-chip">El análisis falló</span>
        <p className="text-base leading-7 text-on-surface-variant">{message}</p>
      </div>
    </Card>
  );
}

export function AnalysisFeature() {
  const analysis = useJobAnalysis();
  const errorMessage = analysis.error instanceof Error ? analysis.error.message : "No se pudo completar el análisis.";

  return (
    <Card id="analysis" className="flex flex-col gap-6 p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <span className="label-chip">Espacio de análisis</span>
          <h2 className="max-w-xl text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
            Pegá una vacante y dejá que el sistema extraiga lo que importa.
          </h2>
        </div>
        <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-success">
          Frontera local de IA
        </span>
      </div>

      <JobDescriptionForm errorMessage={analysis.isError ? errorMessage : null} isPending={analysis.isPending} onSubmit={analysis.submitAnalysis} />

      {analysis.isPending ? (
        <LoadingState />
      ) : analysis.isError ? (
        <ErrorState message={errorMessage} />
      ) : analysis.data ? (
        <AnalysisResultView result={analysis.data} />
      ) : (
        <EmptyState />
      )}
    </Card>
  );
}