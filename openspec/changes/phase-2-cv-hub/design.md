# Design: Phase 2 — CV Hub in Settings

## Technical Approach

Replace SettingsFeature's 4 Cards with a 7-section Accordion. Extract ProfileEditorCard's fields into ContactSection + SkillsSection. Fold experience/education CRUD inline using existing hooks. Add `phone`/`portfolioUrl` through the stack (Prisma → Zod → service → UI).

## Architecture Decisions

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Accordion animation: CSS `grid-template-rows: 0fr/1fr` vs. `max-height` trick vs. framer-motion | max-height needs magic numbers; framer-motion is runtime overhead | **CSS grid** — zero JS, predictable, animatable with `transition` |
| Accordion pattern: Compound vs. generic `<Accordion items={[]}>` | Items array is simpler but locks rendering; compound gives full slot control | **Compound** (`Accordion.Root/Item/Trigger/Content`) — aligns with project's existing `Card.Header/Body` pattern |
| Skills storage: dedicated table vs. CSV string vs. JSON array | Table is overkill for a read-only CV field; JSON array means migration on 40 existing profiles | **CSV string** (existing `profile.skills`) — zero migration, simple split/join for Tags UI |
| Phone validation: regex vs. free text | Intl phone regex is fragile across 200+ formats | **Free text** — user types whatever; CV displays as-is |
| Inline CRUD: extract ExperienceForm/EducationForm from CV pages vs. reimplement | Extracting couples Settings to CV page internals; reimplementing duplicates but is safe | **Reimplement inline** — the forms are simple (6 fields each), reuse controlled-input pattern from `ExperienceManagerPage.tsx` |

## Data Flow

```
SettingsFeature
 ├─ useSettings() ──→ profile (Contact + Skills data)
 │   ├─ saveProfile ──→ PUT /api/profile ──→ Prisma Profile
 │   └─ profile ──→ ContactSection (form) + SkillsSection (tags UI)
 │
 ├─ useExperience() ──→ list/create/update/delete
 │   └─ ExperienceSection (inline CRUD)
 │
 └─ useEducation() ──→ list/create/update/delete
     └─ EducationSection (inline CRUD)
```

Skills parse flow: `"React, TypeScript"` → split by comma → `["React", "TypeScript"]` → render Tags → on save: join with separator → `"React, TypeScript"`. Empty strings after split are filtered out.

## Accordion Component API

```typescript
// Compound pattern via React context — no prop drilling
<Accordion.Root defaultOpen="account">
  <Accordion.Item id="account">
    <Accordion.Trigger>Account</Accordion.Trigger>
    <Accordion.Content>...</Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
```

CSS animation core:
```css
.accordion-content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 200ms ease-out;
}
.accordion-content[aria-expanded="true"] {
  grid-template-rows: 1fr;
}
```

ARIA mapping: `Trigger` → `aria-expanded`, `aria-controls=contentId`. `Content` → `role=region`, `aria-labelledby=triggerId`. Keyboard: Enter/Space on Trigger toggles.

The `Accordion.Root` is the single state owner: `useState<string | null>` tracking `activeId`. On Trigger click, if same ID → toggle (collapse); if different → collapse current + expand new.

## Settings Page Layout

Seven Accordion Items in order, wrapping previous Card content:

| # | Section | Source | State owner |
|---|---------|--------|-------------|
| 01 | Account | Existing SettingsForm (unchanged) | useSettings |
| 02 | Appearance | Existing theme badge (unchanged) | useTheme |
| 03 | Data | Existing export/OAuth/delete (unchanged) | useSettings + useAuth |
| — | **Contact** | 5-field form (email readonly, phone, portfolioUrl, linkedinUrl, githubUrl) | useSettings |
| — | **Skills** | Tag-based comma input | useSettings |
| — | **Experience** | Inline CRUD list | useExperience |
| — | **Education** | Inline CRUD list | useEducation |

The four new sections replace ProfileEditorCard (no longer in DOM). Account (01) stays `defaultOpen`.

Empty states for Contact: form pre-filled with profile data or defaults. Skills: input empty, no tags. Experience/Education: centered message + Add button.

## Section Component Designs

**ContactSection**: `useForm<ProfileUpdateDTO>` with zodResolver. Email rendered as readonly `<Input disabled>`. Save via `useSettings().saveProfile`. The schema already validates URLs; phone passes through as plain text. Four UX states: loading skeleton, populated form, save-pending spinner, error toast.

**SkillsSection**: Controlled `useState<string>` for input, `useState<string[]>` for parsed tags. On input change: parse by comma, filter empties, trim — display as `<Tag onRemove={…}>`. On save: `tags.join(", ")` → `saveProfile({ skills })`. The Tag component already exists at `web/src/shared/components/badge/Tag.tsx` with `onRemove` prop — reuse directly.

**ExperienceSection + EducationSection**: Follow the same inline CRUD pattern as `ExperienceManagerPage.tsx` (controlled form, Edit/Delete buttons per item, confirmation prompt on delete). Reuse `useExperience()` and `useEducation()` hooks as-is — they own query + mutations. Dates use native `<input type="date">`. Help text: top-of-section description; tooltip using existing `Tooltip` component on date fields (`Formato: YYYY-MM-DD`).

## ProfileEditorCard Removal

Field migration plan:

| ProfileEditorCard field | Migrates to | Reason |
|-------------------------|-------------|--------|
| `skills` | SkillsSection | Tag-based UX replaces plain input |
| `linkedinUrl` | ContactSection | Contact info, not profile enrichment |
| `githubUrl` | ContactSection | Same as above |
| `roleTitle` | **Not migrated** | Deprecated from Settings UI — remains in DB for CV generation |
| `experienceLevel` | **Not migrated** | Same |
| `resumeLink` | **Not migrated** | Same |
| `location` | **Not migrated** | Same |

No data loss: fields remain in Prisma schema, Zod schemas, and API responses. They're just not editable in Settings anymore — the CV generation flow still reads them.

## File Structure Plan

```
web/src/shared/components/accordion/
  Accordion.tsx         (Root context + Item + Trigger + Content)
  index.ts              (named exports)
  Accordion.test.tsx    (expand/collapse, keyboard, ARIA, defaultOpen)

web/src/features/settings/
  SettingsFeature.tsx   (restructured: Card wrappers → Accordion.Items)
  components/
    ContactSection.tsx
    SkillsSection.tsx
    ExperienceSection.tsx
    EducationSection.tsx

shared/src/schemas.ts   (+phone, +portfolioUrl in profileSchema & profileUpdateSchema)
server/prisma/schema.prisma (+phone String?, +portfolioUrl String?)
server/src/profile/profile.service.ts (toProfileDTO: +2 fields)
web/src/features/settings/api/validation.ts (+phone, +portfolioUrl in schemas)
```
