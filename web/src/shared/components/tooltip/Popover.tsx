import { useState, type ReactElement, type ReactNode } from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingFocusManager,
  FloatingPortal,
} from "@floating-ui/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/shared/utils/cn";

export interface PopoverProps {
  content: ReactNode;
  children: ReactElement;
  className?: string;
}

export function Popover({
  content,
  children,
  className,
}: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const floating = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom-start",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(floating.context);
  const dismiss = useDismiss(floating.context);
  const role = useRole(floating.context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  return (
    <>
      <span
        ref={floating.refs.setReference}
        className="inline-flex"
        {...getReferenceProps()}
      >
        {children}
      </span>

      <FloatingPortal>
        <AnimatePresence>
          {isOpen && (
            <FloatingFocusManager context={floating.context} modal={false}>
              <motion.div
                ref={floating.refs.setFloating}
                className={cn(
                  "[z-index:var(--z-tooltip)] min-w-[180px] rounded-lg bg-[var(--color-surface-elevated-2)] p-4 shadow-[var(--shadow-lg)]",
                  "focus:outline-none",
                  className,
                )}
                style={{
                  position: "absolute",
                  left: floating.x ?? 0,
                  top: floating.y ?? 0,
                }}
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.2 }}
                {...getFloatingProps()}
              >
                {content}
              </motion.div>
            </FloatingFocusManager>
          )}
        </AnimatePresence>
      </FloatingPortal>
    </>
  );
}
