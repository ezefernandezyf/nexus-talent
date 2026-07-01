import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@/shared/utils/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
  tabsId: string;
}

interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

interface TabsTabProps {
  value: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

interface TabsPanelProps {
  value: string;
  children: ReactNode;
  className?: string;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error("Tabs compound components must be used within <Tabs>");
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function TabsList({ className, children }: TabsListProps) {
  const { value, onChange } = useTabsContext();
  const listRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(e: KeyboardEvent) {
    if (!listRef.current) return;

    const tabs = listRef.current.querySelectorAll<HTMLButtonElement>(
      '[role="tab"]:not([aria-disabled="true"])',
    );
    const currentIndex = Array.from(tabs).findIndex(
      (tab) => tab.getAttribute("aria-selected") === "true",
    );
    let nextIndex: number;

    if (e.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else {
      return;
    }

    e.preventDefault();
    const nextTab = tabs[nextIndex];
    if (nextTab) {
      nextTab.focus();
      // Trigger the tab's onChange via its value attribute
      const tabValue = nextTab.getAttribute("data-tab-value");
      if (tabValue) {
        onChange(tabValue);
      }
    }
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-orientation="horizontal"
      onKeyDown={handleKeyDown}
      className={cn(
        "flex border-b border-[var(--color-on-surface)]/10",
        className,
      )}
    >
      {children}
    </div>
  );
}

function TabsTab({ value: tabValue, children, className, disabled }: TabsTabProps) {
  const { value: activeValue, onChange, tabsId } = useTabsContext();
  const isSelected = activeValue === tabValue;

  return (
    <button
      type="button"
      role="tab"
      data-tab-value={tabValue}
      id={`${tabsId}-tab-${tabValue}`}
      aria-selected={isSelected}
      aria-controls={`${tabsId}-panel-${tabValue}`}
      aria-disabled={disabled}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      onClick={() => onChange(tabValue)}
      className={cn(
        "relative px-4 py-2.5 text-sm font-display font-medium transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]/40 focus-visible:ring-inset",
        isSelected
          ? "text-[var(--color-brand)]"
          : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]",
        disabled && "cursor-not-allowed opacity-40",
        className,
      )}
    >
      {children}
      {isSelected && (
        <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[var(--color-brand)]" />
      )}
    </button>
  );
}

function TabsPanel({ value: panelValue, children, className }: TabsPanelProps) {
  const { value: activeValue, tabsId } = useTabsContext();

  if (activeValue !== panelValue) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`${tabsId}-panel-${panelValue}`}
      aria-labelledby={`${tabsId}-tab-${panelValue}`}
      className={cn("pt-4", className)}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

function TabsRoot({ value, onChange, children, className }: TabsProps) {
  const tabsId = useId();

  const ctx = useMemo<TabsContextValue>(
    () => ({ value, onChange, tabsId }),
    [value, onChange, tabsId],
  );

  return (
    <TabsContext.Provider value={ctx}>
      <div className={cn("flex flex-col", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

TabsRoot.List = TabsList;
TabsRoot.Tab = TabsTab;
TabsRoot.Panel = TabsPanel;

export const Tabs = TabsRoot as typeof TabsRoot & {
  List: typeof TabsList;
  Tab: typeof TabsTab;
  Panel: typeof TabsPanel;
};
