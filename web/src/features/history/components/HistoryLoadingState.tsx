export function HistoryLoadingState() {
  return (
    <div aria-busy="true" aria-label="Cargando historial" className="space-y-3" role="status">
      <div className="grid grid-cols-1 px-4 py-2 text-[10px] font-label uppercase tracking-widest text-on-surface-variant/50 lg:grid-cols-12">
        <div className="lg:col-span-4">Compañía / ID</div>
        <div className="lg:col-span-4">Rol Aplicado</div>
        <div className="lg:col-span-2">Fecha</div>
        <div className="lg:col-span-2 text-right">Acciones</div>
      </div>

      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="animate-pulse grid grid-cols-1 items-center rounded-xl bg-surface-container-low/40 px-4 py-4 lg:grid-cols-12">
          <div className="flex items-center gap-4 lg:col-span-4">
            <div className="h-10 w-10 rounded-lg bg-surface-container" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-surface-container" />
              <div className="h-3 w-24 rounded bg-surface-container/60" />
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="h-4 w-40 rounded bg-surface-container/60" />
          </div>
          <div className="lg:col-span-2">
            <div className="h-4 w-28 rounded bg-surface-container/60" />
          </div>
          <div className="flex items-center justify-start lg:col-span-2 lg:justify-end">
            <div className="h-10 w-24 rounded-lg bg-surface-container" />
          </div>
        </div>
      ))}
    </div>
  );
}
