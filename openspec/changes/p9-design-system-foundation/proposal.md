# Proposal: P9 — Design System Foundation (Clean Slate)

## Intent

Replace "The Signal" design system entirely. User chose clean slate: throw away all DESIGN.md, CSS tokens, fonts, and visual identity. Generate fresh PRODUCT.md + DESIGN.md via `/impeccable init`, let taste-skill + impeccable define a completely new direction — no carry-over of Indigo, Chartreuse, Cabinet Grotesk, or Satoshi. Aggressive anti-convergence: actively avoid generic AI SaaS aesthetic.

## Scope

### In Scope
- `/impeccable init` → PRODUCT.md + DESIGN.md with new project identity
- OKLCH color palette (taste-skill guided, dark or light per skill decision)
- Typography scale: 2 families (display + body), fluid `clamp()` sizing, no Inter/Roboto/Arial
- Spacing scale + radii + shadows + semantic z-index scale
- CSS reset (headings, lists, images, links, forms) + global custom properties in `@theme`
- `npx impeccable detect web/src/` — audit and fix anti-patterns (gradient-text on LandingPage.tsx:78)
- Audit existing 21 components via redesign-existing-projects skill (diagnose only, no rebuilds — that's P10)
- Clean up `web/src/components/ui/` legacy re-export directory (already duplicates `shared/components/`)
- Remove old fonts from `public/fonts/` and `index.css`

### Out of Scope
- Component redesigns (Button, Card, Input, Modal, etc.) — deferred to P10
- Page layout changes (AppLayout, Landing, AuthShell) — deferred to P11
- Animation work — deferred to P12
- Light/dark mode toggle behavior changes — keep ThemeProvider, adapt to new tokens

## Capabilities

### New Capabilities
- `design-system-foundation`: Complete visual identity — PRODUCT.md, DESIGN.md, OKLCH tokens, typography scale, spacing/shadow/radii/z-index scales, CSS reset, global custom properties. Replaces "The Signal" in its entirety.

### Modified Capabilities
- `design-tokens`: Fully replaced. Old spec references Cabinet Grotesk, Satoshi, Indigo+Chartreuse. New spec will define taste-skill-chosen palette, fonts, and token architecture.
- `ui`: Component visual contract changes — no longer references "The Signal" tokens or Cabinet Grotesk font. Behavioral requirements (Badge variants, Button states, WCAG AA, focus indicators) preserved.
- `ui-shell`: Visual identity changed — no longer "The Signal" / Cabinet Grotesk nav labels / old accent. Structural requirements (mobile drawer, sidebar, hamburger) preserved.

## Approach

1. Run `/impeccable init` to generate structured PRODUCT.md + DESIGN.md
2. Let taste-skill (design-taste-frontend, minimalist-ui, high-end-visual-design) guide the visual direction from DESIGN.md output
3. Define all tokens in `@theme` block — zero carry-over from old system
4. Add complete CSS reset + typography scale + z-index scale to `@layer base`
5. Replace all `@layer components` CSS class definitions to reference new tokens
6. Run `npx impeccable detect web/src/` — fix anti-patterns
7. Run redesign-existing-projects audit on 21 components — output diagnosis, defer fixes to P10
8. Delete `web/src/components/ui/` and old font files

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `DESIGN.md` | Replaced | Regenerated via `/impeccable init` |
| `web/src/index.css` | Replaced | 472 lines rewritten: new @theme, reset, component classes |
| `web/src/core/theme.tsx` | Modified | Token references updated to new design system |
| `web/src/shared/components/motion.ts` | Modified | Animation tokens aligned to new scale |
| `web/src/features/landing/pages/LandingPage.tsx` | Modified | Fix gradient-text anti-pattern (L78) |
| `web/src/components/ui/` | Removed | Legacy duplicate re-export directory |
| `public/fonts/` | Replaced | Old fonts removed, new ones added per taste-skill |
| `web/` (package) | Modified | Font dependencies replaced |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Component breakage from CSS class changes | High | Audit all 26+ component files before removing old classes; keep old class names as aliases if needed until P10 |
| New palette feels generic | Medium | 3-skill guidance (taste-skill + minimalist + high-end) + aggressive anti-convergence checklist |
| Light/dark mode breaks with token swap | Medium | Preserve ThemeProvider architecture; replace only values, not data-theme mechanism |
| Scope creep into component redesign | Medium | Explicit P9/P10 boundary: diagnose in P9, redesign in P10 |

## Rollback Plan

1. `git revert` the P9 commit — restores `index.css`, `DESIGN.md`, fonts
2. Re-run `pnpm install` if font packages changed
3. Verify via `pnpm run dev:web` — app must render identically to pre-P9

## Dependencies

- None external. `/impeccable init` uses local script + context.
- `npx impeccable` must be installed globally or via npx.

## Success Criteria

- [ ] `npx impeccable detect web/src/` returns 0 anti-patterns
- [ ] All 21 components render without visual breakage (verified via `pnpm run dev:web`)
- [ ] New `PRODUCT.md` + `DESIGN.md` exist with complete visual identity
- [ ] `@theme` block in `index.css` defines: color palette, typography, spacing, radii, shadows, z-index
- [ ] CSS reset covers: headings, lists, images, links, form elements, box-sizing
- [ ] No references to old fonts (Cabinet Grotesk, Satoshi) remain in any source file
- [ ] No references to old color tokens (Indigo `oklch(0.55 0.22 270)`, Chartreuse `oklch(0.92 0.19 130)`) remain
- [ ] `web/src/components/ui/` directory no longer exists
- [ ] `pnpm run lint && pnpm test` pass
