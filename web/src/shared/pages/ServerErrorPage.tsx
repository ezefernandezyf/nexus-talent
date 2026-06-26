export default function ServerErrorPage() {
  return (
    <main className="deep-space-shell flex min-h-screen items-center justify-center px-4 py-8 text-on-surface sm:px-6 lg:px-8">
      <section className="surface-panel flex w-full max-w-xl flex-col gap-4 p-6 text-center sm:p-8">
        <span className="label-chip mx-auto">500</span>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">Error interno del servidor</h1>
        <p className="text-base leading-8 text-on-surface-variant">Algo salió mal del otro lado. Recargá la aplicación para intentar de nuevo.</p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button className="primary-button" type="button" onClick={() => window.location.reload()}>
            Recargar aplicación
          </button>
        </div>
      </section>
    </main>
  );
}
