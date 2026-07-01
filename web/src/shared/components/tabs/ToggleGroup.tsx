import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { cn } from "@/shared/utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ToggleGroupContextValue {
  value: string[];
  onChange: (value: string[]) => void;
}

interface ToggleGroupProps {
  value: string[];
  onChange: (value: string[]) => void;
  children: ReactNode;
  className?: string;
}

interface ToggleGroupItemProps {
  value: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

function useToggleGroupContext(): ToggleGroupContextValue {
  const ctx = useContext(ToggleGroupContext);
  if (!ctx) {
    throw new Error("ToggleGroup.Item must be used within <ToggleGroup>");
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

function ToggleGroupItem({ value: itemValue, children, className, disabled }: ToggleGroupItemProps) {
  const { value: selectedValues, onChange } = useToggleGroupContext();
  const isSelected = selectedValues.includes(itemValue);

  function handleClick() {
    if (disabled) return;

    if (isSelected) {
      onChange(selectedValues.filter((v) => v !== itemValue));
    } else {
      onChange([...selectedValues, itemValue]);
    }
  }

  return (
    <button
      type="button"
      role="button"
      aria-pressed={isSelected}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "px-3 py-1.5 text-sm font-body font-medium transition-all duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]/40",
        isSelected
          ? "bg-[var(--color-brand)]/10 text-[var(--color-brand)]"
          : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]",
        disabled && "cursor-not-allowed opacity-40",
        className,
      )}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

function ToggleGroupRoot({ value, onChange, children, className }: ToggleGroupProps) {
  const ctx = useMemo<ToggleGroupContextValue>(
    () => ({ value, onChange }),
    [value, onChange],
  );

  return (
    <ToggleGroupContext.Provider value={ctx}>
      <div
        className={cn(
          "inline-flex items-center gap-0.5 rounded-lg bg-[var(--color-surface-elevated-1)] p-0.5",
          className,
        )}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

ToggleGroupRoot.Item = ToggleGroupItem;

export const ToggleGroup = ToggleGroupRoot as typeof ToggleGroupRoot & {
  Item: typeof ToggleGroupItem;
};
