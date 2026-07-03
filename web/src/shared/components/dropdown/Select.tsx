import { useId, useState, useRef, useEffect } from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
} from "@floating-ui/react";
import { CaretDown, Check } from "@phosphor-icons/react";
import { cn } from "@/shared/utils/cn";
import { Portal } from "@/shared/components/_internal/portal";
import { useEscapeKey } from "@/shared/components/_internal/useEscapeKey";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder;

  const floating = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom-start",
    middleware: [offset(4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const generatedId = useId();
  const listboxId = `select-listbox-${generatedId}`;

  // Click outside handler
  useEffect(() => {
    if (!isOpen) return;

    function handleMousedown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
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

  function handleSelect(optionValue: string) {
    onChange?.(optionValue);
    setIsOpen(false);
  }

  return (
    <div className={cn("relative", className)}>
      {/* Trigger */}
      <button
        type="button"
        ref={(node) => {
          triggerRef.current = node;
          floating.refs.setReference(node);
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={listboxId}
        onClick={handleToggle}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-lg bg-[var(--color-surface-base)] px-3 text-sm text-[var(--color-on-surface)]",
          "shadow-[inset_0_0_0_1px] shadow-[var(--color-on-surface)]/10",
          "transition-all duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
          "focus:outline-none focus:shadow-[inset_0_0_0_2px] focus:shadow-[var(--color-brand)]",
        )}
      >
        <span className={cn(!value && "text-[var(--color-on-surface-variant)]")}>
          {selectedLabel}
        </span>
        <CaretDown
          size={14}
          weight="bold"
          className={cn(
            "text-[var(--color-on-surface-variant)] transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {/* Menu */}
      {isOpen && (
        <Portal>
          <div
            ref={(node) => {
              menuRef.current = node;
              floating.refs.setFloating(node);
            }}
            id={listboxId}
            role="listbox"
            aria-label={placeholder}
            className={cn(
              "[z-index:var(--z-dropdown)] min-w-[var(--anchor-width)] rounded-lg bg-[var(--color-surface-elevated-2)] py-1 shadow-[var(--shadow-lg)]",
              "focus:outline-none",
            )}
            style={{
              position: "absolute",
              left: floating.x ?? 0,
              top: floating.y ?? 0,
            }}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled}
                  onClick={() => {
                    if (!option.disabled) {
                      handleSelect(option.value);
                    }
                  }}
                  className={cn(
                    "flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition-colors",
                    "text-[var(--color-on-surface)] hover:bg-[var(--color-surface-elevated-1)]",
                    isSelected && "bg-[var(--color-brand)]/10",
                    option.disabled && "cursor-not-allowed opacity-40",
                  )}
                >
                  <span>{option.label}</span>
                  {isSelected && (
                    <Check size={16} weight="bold" className="text-[var(--color-brand)]" />
                  )}
                </div>
              );
            })}
          </div>
        </Portal>
      )}
    </div>
  );
}
