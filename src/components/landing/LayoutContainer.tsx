import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export interface LayoutContainerProps extends HTMLAttributes<HTMLDivElement> {}

export function LayoutContainer({ className, ...props }: LayoutContainerProps) {
  return <div className={cn("mx-auto max-w-screen-2xl", className)} {...props} />;
}
