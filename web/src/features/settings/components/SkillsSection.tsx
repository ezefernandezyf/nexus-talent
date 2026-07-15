import { useEffect, useState } from "react";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { Tag } from "@/shared/components/badge";
import { useToastStore } from "@/shared/components/toast";
import type { ProfileRecord, ProfileSaveInput } from "../api/validation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SkillsSectionProps {
  profile: ProfileRecord | null;
  isPending: boolean;
  onSave: (input: ProfileSaveInput) => Promise<ProfileRecord>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse a comma-separated skill string into a clean array.
 * Empty strings after split are filtered out per design decision.
 */
function parseSkills(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SkillsSection({
  profile,
  isPending,
  onSave,
}: SkillsSectionProps) {
  const addToast = useToastStore((s) => s.addToast);
  const [inputValue, setInputValue] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // ── Load existing skills from profile on mount ────────────────
  useEffect(() => {
    if (profile?.skills) {
      const parsed = parseSkills(profile.skills);
      setTags(parsed);
      setInputValue(parsed.join(", "));
    } else {
      setTags([]);
      setInputValue("");
    }
  }, [profile?.skills]);

  // ── Input change: parse by comma in real time ─────────────────
  function handleInputChange(value: string) {
    setInputValue(value);
    setTags(parseSkills(value));
  }

  // ── Tag removal: remove from both tags and input text ─────────
  function handleRemoveTag(tag: string) {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    setInputValue(newTags.join(", "));
  }

  // ── Save: join tags back into CSV string ──────────────────────
  async function handleSave() {
    try {
      const skillsCsv = tags.length > 0 ? tags.join(", ") : undefined;
      await onSave({
        displayName: profile?.display_name ?? "",
        email: profile?.email ?? "",
        userId: profile?.id ?? "",
        skills: skillsCsv,
      });
      addToast({
        message: "Skills guardados correctamente.",
        variant: "success",
      });
    } catch {
      addToast({ message: "Error al guardar los skills.", variant: "error" });
    }
  }

  return (
    <div className="space-y-4">
      {/* Input */}
      <Input
        label="Skills (separados por coma)"
        placeholder="React, TypeScript, Node.js"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
      />

      {/* Tags display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="Skills agregados">
          {tags.map((tag) => (
            <Tag key={tag} onRemove={() => handleRemoveTag(tag)}>
              {tag}
            </Tag>
          ))}
        </div>
      )}

      {/* Empty state hint */}
      {tags.length === 0 && (
        <p className="text-sm text-text-secondary">
          No hay skills agregados. Escribí tus skills separados por coma.
        </p>
      )}

      {/* Save button */}
      <Button disabled={isPending} type="button" onClick={handleSave}>
        {isPending ? "Guardando..." : "Guardar skills"}
      </Button>
    </div>
  );
}
