import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export interface AnimatedMountProps {
  children: ReactNode;
  className?: string;
}

/**
 * Mount/unmount wrapper that animates opacity via AnimatePresence + motion.div.
 * Respects `prefers-reduced-motion` — renders instantly when active.
 *
 * When used with `key` on each conditional branch, sibling AnimatedMount instances
 * produce a fade cross-fade:
 *
 * ```tsx
 * {isLoading
 *   ? <AnimatedMount key="loading"><LoadingState /></AnimatedMount>
 *   : <AnimatedMount key="content"><RealContent /></AnimatedMount>
 * }
 * ```
 */
export function AnimatedMount({ children, className }: AnimatedMountProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={className}
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={prefersReducedMotion ? undefined : { opacity: 0 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
