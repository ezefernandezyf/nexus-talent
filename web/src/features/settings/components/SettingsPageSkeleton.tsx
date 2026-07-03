export function SettingsPageSkeleton() {
  return (
    <div aria-label="Cargando configuración" className="animate-pulse space-y-6" role="status">
      {/* Page header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-surface-container" />
        <div className="h-4 w-64 rounded bg-surface-container/60" />
      </div>

      {/* Settings card 1 skeleton — mimics account/profile panel */}
      <div className="rounded-2xl bg-surface-container-low/40 p-6 sm:p-8">
        <div className="mb-6 h-5 w-32 rounded bg-surface-container" />
        <div className="space-y-4">
          <div className="h-4 w-20 rounded bg-surface-container/60" />
          <div className="h-10 w-full rounded-lg bg-surface-container/60" />
          <div className="h-4 w-16 rounded bg-surface-container/60" />
          <div className="h-10 w-full rounded-lg bg-surface-container/60" />
        </div>
        <div className="mt-6 h-10 w-40 rounded-full bg-surface-container" />
      </div>

      {/* Settings card 2 skeleton — mimics connected accounts panel */}
      <div className="rounded-2xl bg-surface-container-low/40 p-6 sm:p-8">
        <div className="mb-6 h-5 w-40 rounded bg-surface-container" />
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 shrink-0 rounded-2xl bg-surface-container/60" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-surface-container/60" />
              <div className="h-3 w-48 rounded bg-surface-container/40" />
            </div>
            <div className="h-6 w-20 rounded-full bg-surface-container/60" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 shrink-0 rounded-2xl bg-surface-container/60" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-surface-container/60" />
              <div className="h-3 w-48 rounded bg-surface-container/40" />
            </div>
            <div className="h-6 w-20 rounded-full bg-surface-container/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
