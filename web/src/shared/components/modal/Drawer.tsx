import {
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "@phosphor-icons/react";
import { cn } from "@/shared/utils/cn";
import { useFocusTrap } from "@/shared/components/_internal/useFocusTrap";
import { useEscapeKey } from "@/shared/components/_internal/useEscapeKey";
import { Portal } from "@/shared/components/_internal/portal";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DrawerSide = "right" | "left" | "bottom";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  side?: DrawerSide;
  className?: string;
}

interface DrawerSubProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const slideVariants: Record<DrawerSide, { hidden: object; visible: object; exit: object }> = {
  right: {
    hidden: { x: "100%" },
    visible: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { x: "100%", transition: { duration: 0.2 } },
  },
  left: {
    hidden: { x: "-100%" },
    visible: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { x: "-100%", transition: { duration: 0.2 } },
  },
  bottom: {
    hidden: { y: "100%" },
    visible: { y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { y: "100%", transition: { duration: 0.2 } },
  },
};

const positionStyles: Record<DrawerSide, string> = {
  right: "right-0 top-0 h-full",
  left: "left-0 top-0 h-full",
  bottom: "bottom-0 left-0 w-full",
};

const sizeStyles: Record<DrawerSide, string> = {
  right: "w-[min(90vw,28rem)]",
  left: "w-[min(90vw,28rem)]",
  bottom: "max-h-[70vh]",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function DrawerBody({ className, children, ...props }: DrawerSubProps) {
  return (
    <div
      className={cn("flex-1 overflow-y-auto text-body text-[var(--color-on-surface-variant)]", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function DrawerActions({ className, children, ...props }: DrawerSubProps) {
  return (
    <div
      className={cn("flex items-center justify-end gap-2 pt-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

function DrawerBase({
  open,
  onClose,
  title,
  children,
  side = "right",
  className,
}: DrawerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useFocusTrap(containerRef, open);
  useEscapeKey(useCallback(() => { if (open) onClose(); }, [open, onClose]));

  // Scroll lock
  useEffect(() => {
    if (!open) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const variants = slideVariants[side];

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 [z-index:var(--z-modal)]"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Backdrop */}
            <motion.div
              data-testid="drawer-backdrop"
              className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-md"
              variants={backdropVariants}
              transition={{ duration: 0.2 }}
              onClick={onClose}
            />

            {/* Drawer panel */}
            <motion.div
              ref={containerRef}
              role="dialog"
              aria-modal="true"
              aria-label={title}
              className={cn(
                "absolute flex flex-col bg-[var(--color-surface-elevated-2)] shadow-[var(--shadow-lg)]",
                positionStyles[side],
                sizeStyles[side],
                "p-5 gap-4",
                className,
              )}
              variants={variants}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                  {title}
                </h2>
                <button
                  type="button"
                  aria-label="Close drawer"
                  onClick={onClose}
                  className="flex items-center justify-center rounded-full p-1 text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-elevated-1)] hover:text-[var(--text-primary)]"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

DrawerBase.Body = DrawerBody;
DrawerBase.Actions = DrawerActions;

export const Drawer = DrawerBase as typeof DrawerBase & {
  Body: typeof DrawerBody;
  Actions: typeof DrawerActions;
};
