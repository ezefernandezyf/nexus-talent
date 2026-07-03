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

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

interface ModalSubProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: { duration: 0.15 },
  },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ModalBody({ className, children, ...props }: ModalSubProps) {
  return (
    <div
      className={cn("text-body text-[var(--color-on-surface-variant)]", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function ModalActions({ className, children, ...props }: ModalSubProps) {
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

function ModalBase({ open, onClose, title, children, className }: ModalProps) {
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

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center p-4 [z-index:var(--z-modal)]"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Backdrop */}
            <motion.div
              data-testid="modal-backdrop"
              className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-md"
              variants={backdropVariants}
              transition={{ duration: 0.2 }}
              onClick={onClose}
            />

            {/* Modal panel */}
            <motion.div
              ref={containerRef}
              role="dialog"
              aria-modal="true"
              aria-label={title}
              className={cn(
                "relative z-10 flex w-full max-w-lg flex-col gap-3 rounded-[var(--radius-lg)] bg-[var(--color-surface-elevated-2)] p-6 shadow-[var(--shadow-lg)]",
                className,
              )}
              variants={modalVariants}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-display text-lg font-semibold text-[var(--color-on-surface)]">
                  {title}
                </h2>
                <button
                  type="button"
                  aria-label="Close modal"
                  onClick={onClose}
                  className="flex items-center justify-center rounded-full p-1 text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-elevated-1)] hover:text-[var(--color-on-surface)]"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              {/* Content */}
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

ModalBase.Body = ModalBody;
ModalBase.Actions = ModalActions;

export const Modal = ModalBase as typeof ModalBase & {
  Body: typeof ModalBody;
  Actions: typeof ModalActions;
};
