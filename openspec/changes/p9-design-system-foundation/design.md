# Design: P9 — Design System Foundation (Clean Slate)

## Technical Approach

Full replacement of "The Signal" identity with taste-skill-guided tokens. `/impeccable init` generates PRODUCT.md + DESIGN.md (new visual direction). The `index.css` is rewritten: new `@theme` block (OKLCH palette, typography, spacing, radii, shadows, z-index, animation), reset in `@layer base`, backward-compat class aliases in `@layer components`. ThemeProvider + `data-theme` mechanism preserved. No component code changes — old CSS class names keep working via redeclared aliases. Old fonts removed, old `web/src/components/ui/` re-export dir deleted, gradient-text anti-pattern fixed in LandingPage.tsx.

## Architecture Decisions

| Option | Tradeoff | Decision |
|--------|----------|----------|
| New class names vs aliases in `@layer components` | New names = clean break but break 21+ files until P10; aliases = compat layer to delete later | **Aliases**. Old class names (`.primary-button`, `.surface-panel`, `.label-chip`, `.field-surface`, `.ghost-frame`, `.tech-chip`, `.status-dot`, `.deep-space-shell`, `.glow-pulse`) redeclared in `@layer components` using new tokens |
| Inline `@theme` tokens vs separate tokens file | Separate file = cleaner for large teams; inline = simpler, follows existing pattern | **Inline in `index.css`**. 21 components, one CSS file. Project convention established. |
| `text-white` light-mode hack keep vs fix | Drop = requires all 15+ `text-white` usages to be changed in P10; keep = ugly but zero component changes | **Keep override** in `@layer base`, marked with `/* TODO P10: remove — use text-on-surface instead */` |
| Preserve `uiTransition` in `motion.ts` vs CSS animation tokens | CSS tokens in `@theme` + keep `motion.ts` as-is | **Both**. Define `--duration-fast/normal/slow` + `--ease-out-expo` in `@theme`; `motion.ts` updated in P12 |
| Delete `web/src/components/ui/` vs keep | Delete = clean, zero loss (it's 1-line re-export); keep = stale dir | **Delete dir** and `test` entries referencing it |
| Gradient-text fix: replace vs remove gradient | Replace with inline token + tailwind approach; remove gradient entirely | **Replace** gradient with new brand accent solid color per impeccable anti-pattern ban on gradient text |

## Data Flow

```
/impeccable init
  └─→ PRODUCT.md + DESIGN.md (new identity)
       └─→ guides index.css tokens + fonts

index.css (rewritten)
  ├─ @theme        → CSS custom properties (Tailwind 4)
  │   ├─ colors    → brand, surface levels, semantic, on-*
  │   ├─ fonts     → display + body (taste-skill chosen)
  │   ├─ spacing   → 0.25rem scale
  │   ├─ radius    → sm/md/lg/xl/full
  │   ├─ shadow    → sm/md/lg/xl/glow
  │   ├─ z-index   → base/dropdown/sticky/modal/toast/tooltip
  │   └─ animation → duration scale + easing tokens
  ├─ @layer base   → CSS reset + data-theme overrides
  ├─ @layer components → old class aliases → new tokens
  └─ @layer utilities → deep-space-shell, glow-pulse

[data-theme="dark|light"]
  └─ redeclares --color-* tokens in @layer base
       └─ no JS changes to ThemeProvider

Existing components (21 files)
  └─ use same Tailwind classes + old CSS class names
       └─ resolve via @theme + @layer components → new tokens
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `DESIGN.md` | Replace | Regenerated via `/impeccable init` — replaces "The Signal" |
| `PRODUCT.md` | Create | Generated via `/impeccable init` — product identity |
| `web/src/index.css` | Replace | Rewrite: new `@theme`, `@layer base` reset, `@layer components` aliases, `@layer utilities` |
| `web/src/features/landing/pages/LandingPage.tsx` | Modify | Fix gradient-text anti-pattern (L78) with solid brand accent |
| `web/src/components/ui/index.ts` | Delete | Legacy one-line re-export of `@/shared/components` |
| `web/src/components/ui/` (dir) | Delete | Remove stale duplicate directory |
| `public/fonts/CabinetGrotesk-*` | Delete | Old display font |
| `public/fonts/Satoshi-*` | Delete | Old body font |
| `public/fonts/*.woff2` | Add | New taste-skill fonts (self-hosted) |
| `web/package.json` | Modify | Font dependencies updated (if any npm font packages) |

**Preserved (zero changes)**:
- `web/src/core/theme.tsx` — `data-theme` + localStorage mechanism intact
- `web/src/shared/components/*.tsx` — component code unchanged
- `web/src/shared/layouts/AppLayout.tsx` — unchanged
- `web/src/shared/utils/cn.ts` — unchanged

## Interfaces / Contracts

### Token categories (architected, values defined by DESIGN.md)

```css
@theme {
  /* Fonts — 2 families: display + body (taste-skill chosen, NOT Inter/Roboto/Arial) */
  --font-display: /* taste-skill */;
  --font-body: /* taste-skill */;
  --font-mono: "JetBrains Mono", monospace;
  --font-label: /* body family */;
  --font-caption: /* body family */;

  /* Colors — OKLCH only */
  --color-brand: oklch(...);
  --color-brand-container: oklch(...);
  --color-surface-base: oklch(...);
  --color-surface-elevated-1: oklch(...);
  --color-surface-elevated-2: oklch(...);
  --color-surface-elevated-3: oklch(...);
  --color-surface-elevated-4: oklch(...);
  --color-surface-elevated-5: oklch(...);
  --color-on-surface: oklch(...);
  --color-on-surface-variant: oklch(...);
  --color-accent: oklch(...);
  --color-success: oklch(...);
  --color-warning: oklch(...);
  --color-error: oklch(...);
  --color-info: oklch(...);

  /* Typography — fluid clamp() */
  --text-display: clamp(3rem, 5vw + 1rem, 5rem);
  --text-h1: clamp(2rem, 3vw + 0.5rem, 3.5rem);
  --text-h2: clamp(1.5rem, 2vw + 0.25rem, 2.5rem);
  /* h3–h6, body, caption, label similarly */

  /* Animation */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Component class aliases (`@layer components`)
```css
@layer components {
  .primary-button { /* new tokens */ }
  .secondary-button { /* new tokens */ }
  .tertiary-button { /* new tokens */ }
  .surface-panel { /* new tokens */ }
  .field-surface { /* new tokens */ }
  .label-chip { /* new tokens */ }
  .tech-chip { /* new tokens */ }
  .ghost-frame { /* new tokens */ }
  .status-dot { /* new tokens */ }
  .deep-space-shell { /* new tokens */ }
  .glow-pulse { /* new tokens */ }
}
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Visual | Dark mode tokens | `pnpm run dev:web` → inspect all pages: contrast, surface levels distinct, brand/accent correct |
| Visual | Light mode tokens | Set `data-theme="light"` → verify token parity, body contrast ≥4.5:1, no pure `#000` / `#fff` |
| Visual | CSS reset | Inspect H1 margins zeroed, img block, list-style none, form font inheritance |
| Detection | Anti-patterns | `npx impeccable detect web/src/` → must exit 0 |
| Regression | Component rendering | All 21 component test files pass: `pnpm run test` |
| Regression | Build | `pnpm run build` must succeed (typecheck + vite build) |
| Audit | No old tokens | `rg -i 'cabinet|satoshi|indigo|chartreuse' web/src/` → zero matches |
| Audit | No old re-export | `web/src/components/ui/` does not exist |

## Migration / Rollout

1. Run `/impeccable init` → `PRODUCT.md` + `DESIGN.md`
2. Add new font files to `public/fonts/`
3. Rewrite `web/src/index.css`: new `@theme`, `@layer base` reset, `@layer components` aliases, `@layer utilities`
4. Fix gradient-text anti-pattern in `LandingPage.tsx`
5. Delete `web/src/components/ui/`
6. Delete old font files from `public/fonts/`
7. Run `npx impeccable detect web/src/` — fix remaining findings
8. Run `pnpm run lint && pnpm test && pnpm run build`

No feature flags. Rollback via `git revert <commit>`.

## Open Questions

- [ ] What happens to `motion.ts` `uiTransition` values? Define as CSS vars but keep JS values as-is until P12.
- [ ] Should the old `text-white` light-mode hack (L195–197) become a proper `--color-on-surface` token mapping? Kept for P9 compat, removed in P10.
