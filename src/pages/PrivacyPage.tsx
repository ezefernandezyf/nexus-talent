import { Link } from "react-router-dom";

export default function PrivacyPage() {
  return (
    <main className="deep-space-shell min-h-screen px-4 py-8 text-on-surface sm:px-6 lg:px-8">
      <section className="surface-panel mx-auto flex w-full max-w-4xl flex-col gap-5 p-6 sm:p-8">
        <span className="label-chip">Privacidad</span>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">Privacidad y manejo de datos</h1>
        <p className="max-w-3xl text-base leading-8 text-on-surface-variant">
          Nexus Talent guarda únicamente la información necesaria para analizar vacantes, historial local y configuraciones operativas. No vendemos datos y no agregamos tracking extra en esta página.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link className="primary-button" to="/">
            Volver al inicio
          </Link>
          <Link className="secondary-button" to="/app/analysis">
            Ir al análisis
          </Link>
        </div>
      </section>
    </main>
  );
}