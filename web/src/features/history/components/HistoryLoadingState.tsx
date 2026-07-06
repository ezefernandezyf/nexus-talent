export function HistoryLoadingState() {
  return (
    <div aria-busy="true" aria-label="Cargando historial" className="animate-pulse space-y-3" role="status">
      {[0, 1, 2, 3, 4].map((row) => (
        <div key={row} className="flex items-center justify-between rounded-lg border border-border bg-surface p-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-40 rounded bg-surface-muted" />
            <div className="h-3 w-24 rounded bg-surface-muted/60" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-6 w-16 rounded bg-surface-muted" />
            <div className="h-4 w-4 rounded bg-surface-muted/60" />
          </div>
        </div>
      ))}
    </div>
  );
}
