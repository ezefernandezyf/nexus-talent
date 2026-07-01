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

      {isOpen && (
        <FloatingPortal>
          <FloatingFocusManager context={floating.context} modal={false}>
            <div
              ref={floating.refs.setFloating}
              className={cn(
                "z-[60] min-w-[180px] rounded-lg bg-[var(--color-surface-elevated-2)] p-4 shadow-[var(--shadow-lg)]",
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
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}
