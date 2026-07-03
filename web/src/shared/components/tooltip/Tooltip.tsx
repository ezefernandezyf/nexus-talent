import { useState, type ReactElement, type ReactNode } from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  useDelayGroup,
  useDelayGroupContext,
} from "@floating-ui/react";
import { cn } from "@/shared/utils/cn";

export interface TooltipProps {
  content: ReactNode;
  children: ReactElement;
  delay?: number;
  className?: string;
}

export function Tooltip({
  content,
  children,
  delay = 200,
  className,
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const floating = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "top",
    middleware: [offset(6), flip(), shift({ padding: 4 })],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(floating.context, {
    move: false,
    delay: { open: delay, close: 100 },
  });
  const focus = useFocus(floating.context);
  const dismiss = useDismiss(floating.context);
  const role = useRole(floating.context, { role: "tooltip" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
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

      {isOpen && (
        <FloatingPortal>
          <div
            ref={floating.refs.setFloating}
            role="tooltip"
            className={cn(
              "[z-index:var(--z-tooltip)] rounded-md bg-[var(--color-surface-elevated-2)] px-2.5 py-1.5 text-xs font-body text-[var(--color-on-surface)] shadow-[var(--shadow-md)]",
              "focus:outline-none",
              className,
            )}
            style={{
              position: "absolute",
              left: floating.x ?? 0,
              top: floating.y ?? 0,
            }}
            {...getFloatingProps()}
          >
            {content}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
