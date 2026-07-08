import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X, CheckCircle, WarningCircle, Info, Warning } from "@phosphor-icons/react";
import { cn } from "@/shared/utils/cn";
import { springTransition } from "../motion";
import type { ToastVariant } from "./toastStore";

export interface ToastProps {
  id: string;
  message: string;
  variant: ToastVariant;
  onDismiss: (id: string) => void;
  duration?: number;
}

const iconMap: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle size={18} weight="fill" />,
  warning: <Warning size={18} weight="fill" />,
  error: <WarningCircle size={18} weight="fill" />,
  info: <Info size={18} weight="fill" />,
};

const variantStyles: Record<ToastVariant, string> = {
  success:
    "bg-[var(--color-success)]/10 border-[var(--color-success)]/30 text-[var(--color-success)]",
  warning:
    "bg-[var(--color-warning)]/10 border-[var(--color-warning)]/30 text-[var(--color-warning)]",
  error:
    "bg-[var(--color-error)]/10 border-[var(--color-error)]/30 text-[var(--color-error)]",
  info:
    "bg-[var(--color-info)]/10 border-[var(--color-info)]/30 text-[var(--color-info)]",
};

const iconBg: Record<ToastVariant, string> = {
  success: "bg-[var(--color-success)]/15",
  warning: "bg-[var(--color-warning)]/15",
  error: "bg-[var(--color-error)]/15",
  info: "bg-[var(--color-info)]/15",
};

export function Toast({
  id,
  message,
  variant,
  onDismiss,
  duration,
}: ToastProps) {
  const prefersReducedMotion = useReducedMotion();

  // Auto-dismiss
  useEffect(() => {
    if (!duration || duration <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  return (
    <motion.div
      role="status"
      layout
      initial={prefersReducedMotion ? false : { opacity: 0, y: -12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0, x: 40, scale: 0.96 }}
      transition={springTransition}
      className={cn(
        "pointer-events-auto flex items-center gap-3 rounded-[var(--radius-md)] border px-4 py-3 shadow-[var(--shadow-md)]",
        "text-body text-sm font-medium",
        variantStyles[variant],
      )}
    >
      <span className={cn("flex items-center justify-center rounded-full p-1", iconBg[variant])}>
        {iconMap[variant]}
      </span>

      <span className="flex-1 text-[var(--text-primary)]">{message}</span>

      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => onDismiss(id)}
        className="flex items-center justify-center rounded-full p-1 text-[var(--color-on-surface-variant)] opacity-60 transition-opacity hover:opacity-100"
      >
        <X size={14} weight="bold" />
      </button>
    </motion.div>
  );
}
