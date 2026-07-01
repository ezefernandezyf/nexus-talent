## Exploration: P10 — Core Components Redesign

### Current State

Nexus Talent V1.1 has 16 component files (plus `motion.ts` and `index.ts`) in `web/src/shared/components/`. These components use a mix of old "The Signal" CSS tokens through backward-compat aliases, and `@layer components` CSS classes (`primary-button`, `secondary-button`, `tertiary-button`, `field-surface`, `label-chip`). The new "Apex" design system is defined in `@theme` (index.css) and documented in PRODUCT.md / DESIGN.md, but NO existing components have been updated to use the new tokens directly.

**Current state**: Dark-first, Deep Teal + Warm Amber palette, Switzer+Geist fonts — but the actual components still render with the old visual system via backward-compat aliases.

---

### Affected Areas

- `web/src/shared/components/Button.tsx` — uses `primary-button/secondary-button/tertiary-button` @layer classes
- `web/src/shared/components/Input.tsx` — uses `field-surface` @layer class
- `web/src/shared/components/Card.tsx` — uses `bg-surface-container*` aliases
- `web/src/shared/components/Badge.tsx` — uses `bg-primary/10 border-primary/25` semantics
- `web/src/shared/components/Modal.tsx` — uses `Card`, `label-chip`, motion.ts
- `web/src/shared/components/EmptyState.tsx` — uses `Card`, `primary-button`
- `web/src/shared/components/LoadingSkeleton.tsx` — uses `bg-surface-container`
- `web/src/shared/components/MobileDrawer.tsx` — uses surface colors, motion.ts
- `web/src/shared/components/MobileMenuButton.tsx` — uses surface colors
- `web/src/shared/components/FeaturePageShell.tsx` — uses `deep-space-shell`, brand colors
- `web/src/shared/components/PageHeader.tsx` — uses `text-white` (P10 TODO marker)
- `web/src/shared/components/Hero.tsx` — inline CSS, surface/primary references
- `web/src/shared/components/Footer.tsx` — uses `bg-surface-container-lowest`, surface colors
- `web/src/shared/components/motion.ts` — Framer Motion variants (needs re-eval for motion/react)
- `web/src/index.css` (`@layer components`) — 11 CSS classes to deprecate/remove
- `server/src/history/history.service.ts` — 4 pre-existing type errors to fix
- `web/src/features/analysis/` — Button, Input, EmptyState consumers
- `web/src/features/auth/` — Button, Input, Card consumers
- `web/src/features/history/` — Button, Input, LoadingSkeleton, EmptyState consumers
- `web/src/features/settings/` — Button, Card, Modal consumers
- `web/src/features/landing/` — MobileDrawer, Hero, motion.ts consumers
- `web/src/shared/layouts/AppLayout.tsx` — MobileDrawer, MobileMenuButton consumers

---

### Current Component Inventory

#### Foundational (0 internal deps)

| Component | LOC | CSS Used | Test | Props/API | Used By |
|-----------|-----|----------|------|-----------|---------|
| **Button** | 20 | `primary-button`, `secondary-button`, `tertiary-button` (@layer) | ❌ | `variant?`: primary/secondary/tertiary, `type?`: button, + HTML button attrs | analysis, auth, history, settings |
| **Input** | 7 | `field-surface` (@layer) | ❌ | `InputHTMLAttributes` (extends native input) | analysis, auth, history |
| **Card** | 19 | `bg-surface-container*` (tailwind), `rounded-xl` | ❌ | `tone?`: surface/low/lowest, + HTML div attrs | auth, settings, Modal, EmptyState |

#### Mid-Level (compose foundations)

| Component | LOC | CSS Used | Test | Props/API | Used By |
|-----------|-----|----------|------|-----------|---------|
| **Badge** | 41 | `bg-primary/10`, `border-primary/25`, `rounded-full`, etc. | ✅ (50 LOC) | `variant?`: info/success/warning/error, `size?`: sm/md, `icon?`: ReactNode | (not imported by features yet) |
| **Modal** | 44 | `Card`, `label-chip`, `bg-surface-container-lowest/70`, `backdrop-blur-sm`, motion from `motion.ts` | ❌ | `children`, `onClose?`, `title` | settings/SettingsFeature |
| **EmptyState** | 29 | `Card`(tone=low), `primary-button` | ✅ (18 LOC) | `title`, `description`, `ctaLabel?`, `ctaHref?` | history, analysis |

#### Page-Level / Layout

| Component | LOC | CSS Used | Test | Props/API | Used By |
|-----------|-----|----------|------|-----------|---------|
| **LoadingSkeleton** | 31 | `bg-surface-container`, `animate-pulse` | ❌ | `variant?`: hero/list-item | settings, history |
| **FeaturePageShell** | 17 | `deep-space-shell`, `bg-primary/10`, `blur-[*]` | ❌ | `children`, `className?` | analysis, history, settings |
| **PageHeader** | 19 | `text-white` (P10 TODO), `text-on-surface-variant` | ✅ (13 LOC) | `title`, `description?`, `action?` | analysis, history, settings |
| **Hero** | 61 | Inline `primary-button`-like, `glow-pulse`, `bg-surface-container`, `border-outline-variant/15` | ✅ (21 LOC) | `title`(ReactNode), `subtitle?`, `description?`, `ctas?` | landing |
| **Footer** | 29 | `bg-surface-container-lowest`, `border-outline-variant/15` | ✅ (16 LOC) | `FooterProps extends HTMLAttributes` | (layout) |
| **MobileDrawer** | 110 | `bg-surface-container-lowest/75`, `bg-surface-container-low`, `bg-surface-container-high`, motion from `motion.ts` | ✅ (17 LOC) | `isOpen`, `items`, `heading`, `onClose`, `actions?` | landing, AppLayout |
| **MobileMenuButton** | 43 | `bg-surface-container-high/70` | ❌ | `isOpen`, extends `ButtonHTMLAttributes` | landing, AppLayout |

#### Support

| File | LOC | Purpose |
|------|-----|---------|
| **motion.ts** | 49 | `fadeUpVariants`, `scaleInVariants`, `panelSlideVariants`, `uiTransition` — Framer Motion shared animation configs |
| **index.ts** | 7 | Re-exports `Hero`, `Card`, `Badge`, `EmptyState`, `LoadingSkeleton`, `PageHeader`, `FeaturePageShell` |

#### Test Coverage Summary

| Has Tests | No Tests |
|-----------|----------|
| Badge, EmptyState, Hero, PageHeader, Footer, MobileDrawer | Button, Input, Card, Modal, LoadingSkeleton, FeaturePageShell, MobileMenuButton, motion.ts |

---

### New Design System Tokens (Available for Redesign)

#### Brand Colors (OKLCH)
| Token | Value | Role |
|-------|-------|------|
| `--color-brand` | `oklch(0.52 0.14 220)` | Primary action, links |
| `--color-brand-container` | `oklch(0.44 0.12 220)` | Brand backgrounds |
| `--color-accent` | `oklch(0.72 0.14 65)` | Warm Amber highlights |
| `--color-accent-container` | `oklch(0.62 0.12 65)` | Accent backgrounds |

#### Surface Elevation (5-tier)
| Token | Dark | Light |
|-------|------|-------|
| `surface-base` | `oklch(0.10 0.006 240)` | `oklch(0.99 0.003 240)` |
| `surface-elevated-1` | `oklch(0.13 0.008 235)` | `oklch(0.97 0.005 240)` |
| `surface-elevated-2` | `oklch(0.16 0.01 235)` | `oklch(0.94 0.008 240)` |
| `surface-elevated-3` | `oklch(0.20 0.01 235)` | `oklch(0.90 0.01 240)` |
| `surface-elevated-4` | `oklch(0.24 0.012 235)` | `oklch(0.86 0.012 240)` |

#### Typography
- **Display/Heading**: Switzer (weights 300-900)
- **Body/Label/Caption**: Geist (weights 300-700)
- **Mono**: JetBrains Mono (weights 400-500)
- Fluid `clamp()` scale from 320px to 1440px

#### Other Tokens
- Spacing: custom 1-32 scale
- Radii: sm(0.5rem) / md(0.75rem) / lg(1rem) / xl(1.25rem) / full(9999px)
- Shadows: sm / md / lg / xl / glow (brand-tinted)
- Z-index: base(1) / dropdown(10) / sticky(20) / modal-backdrop(30) / modal(40) / toast(50) / tooltip(60)
- Animation: fast(150ms) / normal(250ms) / slow(400ms) / ease-out-expo: `cubic-bezier(0.16, 1, 0.3, 1)`

---

### Backward-Compat Aliases (@layer components)

11 CSS classes in `@layer components` use new tokens through alias chain:

| @layer Class | Maps To | Used By |
|--------------|---------|---------|
| `.primary-button` | `--color-primary` → `--color-brand` | Button(variant=primary), Hero, EmptyState |
| `.secondary-button` | `--color-primary` → `--color-brand` | Button(variant=secondary) |
| `.tertiary-button` | `--color-on-surface-variant` | Button(variant=tertiary) |
| `.field-surface` | `--color-surface-container-lowest` | Input |
| `.label-chip` | `--font-label`, `--color-on-surface` | Modal |
| `.surface-panel` | `--color-surface-container` + backdrop | (unused by components) |
| `.ghost-frame` | `white 15%` inset border | (unused) |
| `.tech-chip` | `--font-label`, `--color-on-surface` | (unused) |
| `.status-dot` | `currentColor` | (unused) |

**10 of 11** are semantically mapped. The `--color-primary` → `--color-brand` alias in `@theme` allows old class names to render with new colors. P10 should build new components that use `--color-brand` directly and remove the @layer classes.

---

### Component Dependency Graph

```
motion.ts                     (animation variants)
    ├── Modal                 (scaleInVariants, fadeUpVariants)
    └── MobileDrawer          (panelSlideVariants)

Card                          (no deps — pure div wrapper)
    ├── Modal                 (Card composition)
    ├── EmptyState            (Card composition)
    └── AuthShell, AuthStatusScreen, AuthCallbackPage, SettingsFeature

Button                        (no deps — pure HTML button)
    ├── SignInForm, SignUpForm, LogoutButton
    ├── JobDescriptionForm, AnalysisResultView
    ├── HistoryCard, HistoryDetailEditor
    ├── SettingsForm, SettingsFeature, SettingsPage
    └── AnalysisFeature (indirect via consumers)

Input                         (no deps — pure HTML input)
    ├── SignInForm, SignUpForm
    ├── AnalysisResultView
    └── HistoryDetailEditor

FeaturePageShell              (no deps)
    ├── AnalysisPage, HistoryPage, HistoryDetailPage, SettingsPage

PageHeader                    (no deps)
    ├── AnalysisPage, HistoryPage, HistoryDetailPage, SettingsPage

LoadingSkeleton               (no deps)
    ├── HistoryLoadingState
    └── SettingsPage

EmptyState                    (depends on Card)
    ├── HistoryEmptyState
    └── AnalysisFeature

MobileDrawer                  (depends on motion.ts)
    ├── LandingPage
    └── AppLayout

MobileMenuButton              (no deps)
    ├── LandingPage
    └── AppLayout
```

---

### Server Lint Errors (First P10 Task)

4 type errors in `server/src/history/history.service.ts`:

```
Line 97: Type 'object' is not assignable to type 'string'   (skillGroups: result.skillGroups as object)
Line 98: Type 'object' is not assignable to type 'string'   (keywords: result.keywords as object)
Line 99: Type 'object' is not assignable to type 'string'   (gaps: result.gaps as object)
Line 100: Type '{ emailLinkedIn: ...; dmShort: ...; } | DbNull' is not assignable to 'string'  (recruiterMessages)
```

**Root cause**: Prisma schema uses `Json` type for these fields, but the code casts to `object` which is incompatible. **Fix**: Remove the `as object` casts — the DTO types already provide proper `JsonValue` typing. `recruiterMessages` needs `Prisma.JsonNull` instead of `Prisma.DbNull`.

---

### Anti-Pattern Audit

`node .opencode/skills/impeccable/scripts/detect.mjs --json web/src/shared/components` returned **0 findings** — no anti-patterns detected in current components.

---

### Approaches

1. **Batch by dependency (Recommended)** — Foundation → Mid-level → Complex → Quality
   - **Batch 1**: Fix server lint, Button, Input, Card, Badge + tests
   - **Batch 2**: Modal, EmptyState, LoadingSkeleton, Toast (new), Dropdown (new), Tabs (new), Tooltip (new) + tests
   - **Batch 3**: PageHeader, FeaturePageShell, Hero, Footer, MobileDrawer, MobileMenuButton, motion.ts migration
   - **Batch 4**: Smoke test all consumers, remove `@layer components`, remove backward-compat aliases
   - **Batch 5**: Audit, final tests, impeccable detect pass
   - Pros: Manageable PRs, can deploy each batch, features break only within a batch, parallel work possible
   - Cons: Mid-phase features can't use new components until the batch ships
   - Effort: **Medium** (best risk/reward)

2. **Big Bang** — All 12 component families in one sweep
   - Pros: Single migration, no intermediate breakage
   - Cons: **Extreme risk** (all features break until the PR is merged), single 1000+ line PR, impossible to review
   - Effort: **High** (review-killer)

3. **Per-component SDD cycles** — Each component gets mini SDD (spec→design→tasks→apply→verify)
   - Pros: Maximum safety, thorough testing per component, clean DAG
   - Cons: **Extremely slow** (12 cycles × 5 phases = 60 orchestrator handoffs), overhead of phases for simple components like Button
   - Effort: **Very High** (process overhead)

### Recommendation

**Batch by dependency** (Approach 2). The batch sizes are natural: Button/Input/Card are < 50 LOC each, Modal/EmptyState/Toast are moderate, and the page-level components are mostly presentational. This maps cleanly to 3-4 chained PRs of ~200-300 lines each, keeping reviews manageable.

The server lint fix should be PR #0 — it's independent and blocking. Each batch PR removes its matching `@layer components` CSS class when the new component ships.

### Risks

- **Framer Motion → motion/react migration**: `motion.ts` currently uses `framer-motion`. React 19 with the compiler may change animation patterns. Need to verify `motion/react` compatibility.
- **Feature flag complexity**: Old and new components may coexist temporarily. All consumers must import from the new path, not the old barrel export, to avoid alias issues.
- **Type parity**: New components must accept the same props as old ones so feature code doesn't break. Changes to prop APIs must be communicated in the spec phase.
- **CSS @layer removal timing**: `@layer components` classes cannot be removed until ALL consumers have migrated. The Button class is referenced in the widest spread.
- **Light mode parity**: All new components MUST render correctly in both dark and light modes. The current components have fragmented light-mode support.
- **E2E breakage**: Playwright tests may reference CSS class names or DOM structures that change. E2E selectors must be updated per batch.
- **Server lint fix first**: The 4 type errors in `history.service.ts` are blocking P10 start — they fail `pnpm run lint` which blocks CI.

### Ready for Proposal

**Yes** — full inventory, dependency graph, token mapping, and server lint issues are documented. Recommended approach is Batch by Dependency with the server lint fix as PR #0.
