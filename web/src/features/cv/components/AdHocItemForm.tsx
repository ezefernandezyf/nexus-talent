import { useState } from "react";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { Card } from "@/shared/components/card";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AdHocItem {
  type: "experience" | "education" | "project" | "custom";
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
}

interface AdHocItemFormProps {
  items: AdHocItem[];
  onChange: (items: AdHocItem[]) => void;
}

const ITEM_TYPES = [
  { value: "experience" as const, label: "Experience" },
  { value: "education" as const, label: "Education" },
  { value: "project" as const, label: "Project" },
  { value: "custom" as const, label: "Custom" },
];

// ---------------------------------------------------------------------------
// Chips for added items
// ---------------------------------------------------------------------------

function ItemChip({ item, onRemove }: { item: AdHocItem; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--accent-muted)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
      <span className="truncate max-w-[200px]">{item.title}</span>
      <button
        type="button"
        aria-label={`Remove ${item.title}`}
        className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-[var(--accent)]/20"
        onClick={onRemove}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function AdHocItemForm({ items, onChange }: AdHocItemFormProps) {
  const [type, setType] = useState<AdHocItem["type"]>("experience");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const handleAdd = () => {
    if (!title.trim()) return;

    const newItem: AdHocItem = {
      type,
      title: title.trim(),
      ...(subtitle.trim() ? { subtitle: subtitle.trim() } : {}),
      ...(date ? { date } : {}),
      ...(description.trim() ? { description: description.trim() } : {}),
    };

    onChange([...items, newItem]);
    setTitle("");
    setSubtitle("");
    setDate("");
    setDescription("");
  };

  const handleRemove = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <Card padding="lg">
        <div className="space-y-4">
          {/* Type selector + title */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ad-hoc-type" className="mb-2 block text-sm font-medium text-text-primary">
                Type
              </label>
              <select
                id="ad-hoc-type"
                value={type}
                onChange={(e) => setType(e.target.value as AdHocItem["type"])}
                className="w-full h-11 rounded-md border border-border bg-surface px-4 text-sm text-text-primary focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
              >
                {ITEM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Built a portfolio"
              required
            />
          </div>

          {/* Subtitle + Date */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Personal project"
            />
            <Input
              label="Date"
              type="month"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <Input
              label="Description"
              multiline
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the item"
            />
          </div>

          <Button type="button" onClick={handleAdd} disabled={!title.trim()}>
            Add Item
          </Button>
        </div>
      </Card>

      {/* Added items chips */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2" data-testid="added-items">
          {items.map((item, index) => (
            <ItemChip
              key={`${item.type}-${item.title}-${index}`}
              item={item}
              onRemove={() => handleRemove(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
