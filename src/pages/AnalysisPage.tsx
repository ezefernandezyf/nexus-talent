import { AnalysisFeature } from "../features/analysis";
import { useAnalysisRepository } from "../features/analysis/hooks/useAnalysisRepository";

export function AnalysisPage() {
  const { repository, scope } = useAnalysisRepository();

  return (
    <>
      <section className="flex flex-col gap-3 pt-2 sm:pt-4">
        <span className="label-chip">Frontera local de IA</span>
        <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
          Nuevo Análisis de Reclutamiento
        </h1>
        <p className="max-w-3xl text-base leading-7 text-on-surface-variant sm:text-lg">
          Pegá una vacante completa y dejá que el sistema extraiga el resumen, la matriz de habilidades y el borrador de contacto.
        </p>
      </section>

      <AnalysisFeature repository={repository} scope={scope} />
    </>
  );
}
