import { AnalysisFeature } from "../features/analysis";
import { useAnalysisRepository } from "../features/analysis/hooks/useAnalysisRepository";

export function AnalysisPage() {
  const { repository, scope } = useAnalysisRepository();

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3 pt-2 sm:pt-4">
        <span className="label-chip">Espacio de análisis</span>
        <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
          Nuevo Análisis de Reclutamiento
        </h1>
        <p className="max-w-3xl text-base leading-7 text-on-surface-variant sm:text-lg">
          Pegá la descripción del puesto, elegí el tono del mensaje y dejá que el sistema extraiga el resumen, la matriz de habilidades y el borrador.
        </p>
      </section>

      <AnalysisFeature repository={repository} scope={scope} />

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="surface-panel flex items-start gap-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-high text-primary">K</div>
          <div>
            <h2 className="mb-1 text-xs font-bold uppercase tracking-widest text-on-surface">Keywords</h2>
            <p className="text-[11px] leading-relaxed text-on-surface-variant">Extracción automática de habilidades clave y requisitos técnicos.</p>
          </div>
        </article>
        <article className="surface-panel flex items-start gap-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-high text-primary">D</div>
          <div>
            <h2 className="mb-1 text-xs font-bold uppercase tracking-widest text-on-surface">Drafting</h2>
            <p className="text-[11px] leading-relaxed text-on-surface-variant">Generación de borradores de contacto alineados al rol y al tono seleccionado.</p>
          </div>
        </article>
        <article className="surface-panel flex items-start gap-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-high text-primary">G</div>
          <div>
            <h2 className="mb-1 text-xs font-bold uppercase tracking-widest text-on-surface">Gap Analysis</h2>
            <p className="text-[11px] leading-relaxed text-on-surface-variant">Identificación clara de brechas entre la vacante y tu perfil.</p>
          </div>
        </article>
      </section>
    </div>
  );
}
