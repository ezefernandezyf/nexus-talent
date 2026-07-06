import { useId, useState, useRef, useEffect, type ReactElement, type ReactNode } from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
} from "@floating-ui/react";
import { cn } from "@/shared/utils/cn";
import { Portal } from "@/shared/components/_internal/portal";
import { useEscapeKey } from "@/shared/components/_internal/useEscapeKey";

export interface DropdownItem {
  label: string;
  onSelect?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
}

export interface DropdownProps {
  trigger: ReactElement;
  items: DropdownItem[];
  className?: string;
}

export function Dropdown({ trigger, items, className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const menuId = `dropdown-menu-${generatedId}`;

  const floating = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom-start",
    middleware: [offset(4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  // Click outside handler
  useEffect(() => {
    if (!isOpen) return;

    function handleMousedown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        containerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    }

    document.addEventListener("mousedown", handleMousedown);
    return () => document.removeEventListener("mousedown", handleMousedown);
  }, [isOpen]);

  useEscapeKey(() => setIsOpen(false));

  function handleToggle() {
    setIsOpen((prev) => !prev);
  }

  function handleSelect(index: number) {
    const item = items[index];
    if (item && !item.disabled) {
      item.onSelect?.();
      setIsOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      {/* Trigger */}
      <div
        ref={floating.refs.setReference}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={handleToggle}
      >
        {trigger}
      </div>

      {/* Menu */}
      {isOpen && (
        <Portal>
          <div
            ref={(node) => {
              menuRef.current = node;
              floating.refs.setFloating(node);
            }}
            id={menuId}
            role="menu"
            aria-orientation="vertical"
            className={cn(
              "[z-index:var(--z-dropdown)] min-w-[160px] rounded-lg bg-[var(--color-surface-elevated-2)] py-1 shadow-[var(--shadow-lg)]",
              "focus:outline-none",
            )}
            style={{
              position: "absolute",
              left: floating.x ?? 0,
              top: floating.y ?? 0,
            }}
          >
            {items.map((item, index) => (
              <div
                key={item.label}
                role="menuitem"
                aria-disabled={item.disabled}
                onClick={() => handleSelect(index)}
                className={cn(
                  "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors",
                  "text-[var(--text-primary)] hover:bg-[var(--color-surface-elevated-1)]",
                  item.disabled && "cursor-not-allowed opacity-40",
                )}
              >
                {item.icon && (
                  <span className="text-[var(--color-on-surface-variant)]">{item.icon}</span>
                )}
                {item.label}
              </div>
            ))}
          </div>
        </Portal>
      )}
    </div>
  );
}
