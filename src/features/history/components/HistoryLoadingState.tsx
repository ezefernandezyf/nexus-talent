import { LoadingSkeleton } from "../../../components/ui";

export function HistoryLoadingState() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Cargando historial" role="status">
      <div className="grid grid-cols-1 lg:grid-cols-12 px-4 py-2 text-[10px] font-label uppercase tracking-widest text-on-surface-variant/50">
        <div className="lg:col-span-4">Compañía / ID</div>
        <div className="lg:col-span-3">Rol Aplicado</div>
        <div className="lg:col-span-2">Fecha</div>
        <div className="lg:col-span-3 text-right">Match Index</div>
      </div>

      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="grid grid-cols-1 lg:grid-cols-12 items-center rounded-xl bg-surface-container-low/40 px-4 py-4">
          <div className="lg:col-span-4 flex items-center gap-4">
            <LoadingSkeleton />
          </div>
          <div className="lg:col-span-3">
            <LoadingSkeleton />
          </div>
          <div className="lg:col-span-2">
            <LoadingSkeleton />
          </div>
          <div className="lg:col-span-3 flex flex-col items-end gap-2">
            <LoadingSkeleton />
          </div>
        </div>
      ))}
    </div>
  );
}