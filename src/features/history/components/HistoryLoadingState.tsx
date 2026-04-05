export function HistoryLoadingState() {
  return (
    <div className="space-y-4" aria-label="Cargando historial" aria-busy="true" role="status">
      <div className="rounded-[1.5rem] bg-surface-container-lowest/50 p-5 sm:p-6">
        <div className="space-y-4 animate-pulse">
          <div className="h-4 w-36 rounded-full bg-surface-bright" />
          <div className="h-7 w-3/4 rounded-full bg-surface-bright/80" />
          <div className="h-4 w-40 rounded-full bg-surface-bright/80" />
          <div className="h-4 w-full rounded-full bg-surface-bright/80" />
          <div className="flex gap-2 pt-2">
            <div className="h-9 w-24 rounded-full bg-surface-bright/80" />
            <div className="h-9 w-28 rounded-full bg-surface-bright/80" />
            <div className="h-9 w-20 rounded-full bg-surface-bright/80" />
          </div>
        </div>
      </div>

      <div className="rounded-[1.5rem] bg-surface-container-lowest/50 p-5 sm:p-6">
        <div className="space-y-4 animate-pulse">
          <div className="h-4 w-28 rounded-full bg-surface-bright" />
          <div className="h-7 w-2/3 rounded-full bg-surface-bright/80" />
          <div className="h-4 w-36 rounded-full bg-surface-bright/80" />
          <div className="h-4 w-full rounded-full bg-surface-bright/80" />
          <div className="flex gap-2 pt-2">
            <div className="h-9 w-20 rounded-full bg-surface-bright/80" />
            <div className="h-9 w-24 rounded-full bg-surface-bright/80" />
            <div className="h-9 w-28 rounded-full bg-surface-bright/80" />
          </div>
        </div>
      </div>
    </div>
  );
}