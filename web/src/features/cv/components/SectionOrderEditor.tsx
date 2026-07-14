import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card } from "@/shared/components/card";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SectionOption {
  id: string;
  label: string;
}

interface SectionOrderEditorProps {
  options: SectionOption[];
  value: string[];
  onChange: (orderedIds: string[]) => void;
}

// ---------------------------------------------------------------------------
// Sortable Item
// ---------------------------------------------------------------------------

interface SortableItemProps {
  id: string;
  label: string;
  index: number;
}

function SortableItem({ id, label, index }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid="section-order-item"
      className={`flex items-center gap-3 ${isDragging ? "z-10" : ""}`}
    >
      {/* Drag handle */}
      <button
        type="button"
        data-testid="drag-handle"
        className="flex h-8 w-8 cursor-grab items-center justify-center rounded-md text-text-tertiary hover:bg-surface-muted hover:text-text-secondary active:cursor-grabbing"
        aria-label={`Drag to reorder ${label}`}
        {...attributes}
        {...listeners}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="5" cy="3" r="1.5" fill="currentColor" />
          <circle cx="11" cy="3" r="1.5" fill="currentColor" />
          <circle cx="5" cy="8" r="1.5" fill="currentColor" />
          <circle cx="11" cy="8" r="1.5" fill="currentColor" />
          <circle cx="5" cy="13" r="1.5" fill="currentColor" />
          <circle cx="11" cy="13" r="1.5" fill="currentColor" />
        </svg>
      </button>

      {/* Position badge */}
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent-muted)] text-xs font-semibold text-[var(--accent)]">
        {index + 1}
      </span>

      {/* Label */}
      <span className="text-sm font-medium text-text-primary">{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function SectionOrderEditor({
  options,
  value,
  onChange,
}: SectionOrderEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = value.indexOf(active.id as string);
    const newIndex = value.indexOf(over.id as string);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...value];
    reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, active.id as string);

    onChange(reordered);
  };

  // Build a lookup for option labels
  const labelMap = new Map(options.map((o) => [o.id, o.label]));

  // Only render items that are in both value and options
  const items = value.filter((id) => labelMap.has(id));

  if (items.length === 0) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-sm text-text-tertiary">No sections configured</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((id, index) => (
            <SortableItem
              key={id}
              id={id}
              label={labelMap.get(id) ?? id}
              index={index}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
