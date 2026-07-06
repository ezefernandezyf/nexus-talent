export function AppLayoutSkeleton() {
  return (
    <div
      aria-label="Cargando aplicación"
      className="relative min-h-screen bg-background"
      role="status"
    >
      {/* Header skeleton — sticky top bar */}
      <div className="sticky top-0 z-50 border-b border-border bg-surface/85 backdrop-blur-sm">
        <div className="container-editorial flex h-16 animate-pulse items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="h-6 w-32 rounded-md bg-surface-muted" />
            <div className="hidden gap-2 md:flex">
              <div className="h-4 w-16 rounded-md bg-surface-muted" />
              <div className="h-4 w-20 rounded-md bg-surface-muted" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden h-9 w-28 animate-pulse rounded-md bg-surface-muted md:block" />
            <div className="hidden h-9 w-9 animate-pulse rounded-md bg-surface-muted md:block" />
            <div className="hidden h-9 w-9 animate-pulse rounded-md bg-surface-muted md:block" />
          </div>
        </div>
      </div>

      {/* Content area */}
      <main className="container-editorial py-12 md:py-16">
        <div className="flex flex-col gap-6">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-muted" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-32 animate-pulse rounded-xl bg-surface-muted" />
            <div className="h-32 animate-pulse rounded-xl bg-surface-muted" />
          </div>
          <div className="h-64 animate-pulse rounded-xl bg-surface-muted" />
        </div>
      </main>

      {/* Footer skeleton */}
      <div className="border-t border-border bg-surface">
        <div className="container-editorial flex animate-pulse items-center justify-between py-12">
          <div className="h-6 w-32 rounded-md bg-surface-muted" />
          <div className="flex gap-8">
            <div className="h-4 w-12 rounded-md bg-surface-muted" />
            <div className="h-4 w-12 rounded-md bg-surface-muted" />
            <div className="h-4 w-12 rounded-md bg-surface-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
