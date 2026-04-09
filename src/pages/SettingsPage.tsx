import { SettingsFeature } from "../features/settings";

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3 pt-2 sm:pt-4">
        <span className="label-chip">Panel admin</span>
        <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
          Settings
        </h1>
        <p className="max-w-3xl text-base leading-7 text-on-surface-variant sm:text-lg">
          Administrá los ajustes operativos sin tocar código y mantené el comportamiento global bajo control.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="surface-panel p-5">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Modo mantenimiento</h2>
          <p className="text-sm leading-6 text-on-surface-variant">Apagá el acceso público cuando necesites frenar la operación temporalmente.</p>
        </article>
        <article className="surface-panel p-5">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Dominios permitidos</h2>
          <p className="text-sm leading-6 text-on-surface-variant">Definí quién puede entrar al panel y evitá cambios fuera del entorno esperado.</p>
        </article>
        <article className="surface-panel p-5">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Estado guardado</h2>
          <p className="text-sm leading-6 text-on-surface-variant">La configuración se persiste con validación y feedback visible al guardar.</p>
        </article>
      </section>

      <SettingsFeature />
    </div>
  );
}
