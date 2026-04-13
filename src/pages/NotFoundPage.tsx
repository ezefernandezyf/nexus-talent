import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="deep-space-shell flex min-h-screen items-center justify-center px-4 py-8 text-on-surface sm:px-6 lg:px-8">
      <section className="surface-panel flex w-full max-w-xl flex-col gap-4 p-6 text-center sm:p-8">
        <span className="label-chip mx-auto">404</span>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">404</h1>
        <p className="text-base leading-8 text-on-surface-variant">La ruta no existe o fue movida. Volvé al inicio para seguir trabajando desde la entrada principal.</p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link className="primary-button" to="/">
            Volver al inicio
          </Link>
          <Link className="secondary-button" to="/privacy">
            Ver privacidad
          </Link>
        </div>
      </section>
    </main>
  );
}