import type { PropsWithChildren } from "react";
import { cn } from "@/shared/utils/cn";

interface FeaturePageShellProps extends PropsWithChildren {
  className?: string;
}

export function FeaturePageShell({ children, className }: FeaturePageShellProps) {
  return (
    <main className={cn("container-editorial py-12 md:py-16", className)}>
      {children}
    </main>
  );
}
