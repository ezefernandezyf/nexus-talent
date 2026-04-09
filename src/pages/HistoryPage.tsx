import { HistoryFeature } from "../features/history";
import { useAnalysisRepository } from "../features/analysis/hooks/useAnalysisRepository";

export function HistoryPage() {
  const { repository, scope } = useAnalysisRepository();

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3 pt-2 sm:pt-4">
        <span className="label-chip">Historial persistido</span>
        <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
          Historial de Análisis
        </h1>
        <p className="max-w-3xl text-base leading-7 text-on-surface-variant sm:text-lg">
          Revisá ejecuciones anteriores, compará señales y volvé a usar los resultados sin perder el foco del flujo principal.
        </p>
      </section>

      <HistoryFeature repository={repository} scope={scope} />
    </div>
  );
}
