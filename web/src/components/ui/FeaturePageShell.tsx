import type { PropsWithChildren } from "react";
import { cn } from "../../lib/cn";

interface FeaturePageShellProps extends PropsWithChildren {
  className?: string;
}

export function FeaturePageShell({ children, className }: FeaturePageShellProps) {
  return (
    <main className={cn("deep-space-shell relative overflow-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10", className)}>
      <div className="absolute left-0 top-0 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-[140px]" />
      <div className="absolute right-0 top-24 -z-10 h-80 w-80 rounded-full bg-primary-container/10 blur-[160px]" />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 sm:gap-10">{children}</div>
    </main>
  );
}
