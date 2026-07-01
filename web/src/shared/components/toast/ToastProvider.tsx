import { AnimatePresence } from "framer-motion";
import { useToastStore } from "./toastStore";
import { Toast } from "./Toast";
import { Portal } from "@/shared/components/_internal/portal";

/**
 * Renders the toast stack in a portal at the bottom-right of the viewport.
 * Must be mounted once near the root of the app tree.
 */
export function ToastProvider() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <Portal>
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="pointer-events-none fixed bottom-4 right-4 z-[50] flex flex-col gap-2"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              message={toast.message}
              variant={toast.variant}
              duration={toast.duration}
              onDismiss={removeToast}
            />
          ))}
        </AnimatePresence>
      </div>
    </Portal>
  );
}
