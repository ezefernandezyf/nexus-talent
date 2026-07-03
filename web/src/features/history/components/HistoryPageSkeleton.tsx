export function HistoryPageSkeleton() {
  return (
    <div aria-label="Cargando historial" className="animate-pulse space-y-6" role="status">
      {/* Page header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-surface-container" />
        <div className="h-4 w-72 rounded bg-surface-container/60" />
      </div>

      {/* Column headers skeleton — mimics table header */}
      <div className="grid grid-cols-1 gap-2 px-4 py-2 lg:grid-cols-12">
        <div className="h-3 w-24 rounded bg-surface-container/40 lg:col-span-4" />
        <div className="hidden h-3 w-20 rounded bg-surface-container/40 lg:col-span-4 lg:block" />
        <div className="hidden h-3 w-16 rounded bg-surface-container/40 lg:col-span-2 lg:block" />
      </div>

      {/* Row skeletons — mimics HistoryList row items */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-1 items-center rounded-xl bg-surface-container-low/40 px-4 py-4 lg:grid-cols-12"
        >
          <div className="flex items-center gap-4 lg:col-span-4">
            <div className="h-10 w-10 rounded-lg bg-surface-container" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-surface-container" />
              <div className="h-3 w-24 rounded bg-surface-container/60" />
            </div>
          </div>
          <div className="mt-2 lg:col-span-4 lg:mt-0">
            <div className="h-4 w-40 rounded bg-surface-container/60" />
          </div>
          <div className="mt-2 lg:col-span-2 lg:mt-0">
            <div className="h-4 w-28 rounded bg-surface-container/60" />
          </div>
          <div className="mt-2 flex items-center justify-start lg:col-span-2 lg:mt-0 lg:justify-end">
            <div className="h-10 w-24 rounded-lg bg-surface-container" />
          </div>
        </div>
      ))}
    </div>
  );
}
