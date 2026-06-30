# Tasks: P9 — Design System Foundation

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~800 review lines, ~3000 total diff (incl. ~2000 deletion lines) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Identity + tokens (base: develop) → PR 2: Aliases + cleanup + verify (base: PR 1) |
| Delivery strategy | auto-chain (resolved) |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Yes (resolved — feature-branch-chain)
Chained PRs recommended: Yes (2 PRs created)
Chain strategy: feature-branch-chain
400-line budget risk: High (managed via chained PRs)

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Product identity + token architecture | PR 1 | `/impeccable init` → PRODUCT.md/DESIGN.md, rewrite `web/src/index.css` (@theme, @layer base, @layer utilities). Base: develop. ~550 review lines. Verify: DESIGN.md exists, index.css loads without errors. |
| 2 | Component compat + cleanup + verify | PR 2 | `@layer components` 11 aliases, fix gradient-text L78, delete `web/src/components/ui/`, run detect/test/build. Base: PR 1. ~250 review lines + ~2000 deletion lines. |

## Phase 1: Identity Foundation

- [x] 1.1 Run `npx impeccable init` from project root — generates `PRODUCT.md` + `DESIGN.md` with new taste-skill visual identity (Deep Teal + Warm Amber "Apex"), zero "Signal"/Indigo/Chartreuse/Cabinet Grotesk/Satoshi carry-over. Verify: `DESIGN.md` exists with OKLCH palette + taste-skill fonts (Switzer + Geist).
- [x] 1.2 Inspect DESIGN.md output — confirmed dark-first token architecture, brand/accent/surface/semantic color groups, clamp() type scale, spacing/radius/shadow/z-index/animation tokens defined.

## Phase 2: Token Architecture

- [x] 2.1 Replace `web/src/index.css` `@theme` block: OKLCH CSS custom properties with `--color-brand` (Deep Teal oklch(0.52 0.14 220)), `--color-surface-base` through `--color-surface-elevated-5`, `--color-on-surface*`, `--color-accent` (Warm Amber oklch(0.72 0.14 65)), `--color-success/warning/error/info`. Includes `--font-display` (Switzer) + `--font-body` (Geist), JetBrains Mono preserved. Fluid `clamp()` `--text-display` through `--text-caption`, `--radius-*`, `--shadow-*` with glow, `--z-*` (base/dropdown/sticky/modal/toast/tooltip), `--duration-*` + `--ease-out-expo`.
- [x] 2.2 Write `@layer base`: border-box reset, zero heading margins, list-style none, img block+max-width, form font inheritance, body background + color via tokens. Preserved `[data-theme="light"]` override block with full token parity. Kept `text-white` hack with `/* TODO P10: remove */`. `::selection` uses new brand token. Removed Material Symbols import and Cabinet/Satoshi `@font-face` blocks.
- [x] 2.3 Write `@layer utilities`: `deep-space-shell` background + `glow-pulse` animation using new brand tokens. Both with `data-theme="light"` variants.

## Phase 3: Component Compatibility

- [x] 3.1 Write `@layer components` in `web/src/index.css`: redeclare all 11 old CSS classes — `.primary-button`, `.secondary-button`, `.tertiary-button`, `.surface-panel`, `.field-surface`, `.label-chip`, `.tech-chip`, `.ghost-frame`, `.status-dot`, `.deep-space-shell`, `.glow-pulse` — using NEW tokens only. Preserve hover/focus/disabled states. Verify: `pnpm run build` passes (typecheck + vite).
- [x] 3.2 Fix gradient-text anti-pattern in `web/src/features/landing/pages/LandingPage.tsx` L78: replace `bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent` on "Actionable Insights" span with solid `text-accent` per impeccable gradient-text ban.

## Phase 4: Legacy Removal

- [x] 4.1 Delete `web/src/components/ui/` directory entirely — all 21 files are duplicates of `web/src/shared/components/`. Remove `web/src/components/ui/index.ts` one-line re-export. Verify: `ls web/src/components/ui/` returns no such file.
- [x] 4.2 Remove old font references: delete all Cabinet Grotesk + Satoshi `@font-face` blocks from old `index.css` (already handled by rewrite). Delete Material Symbols Google Fonts import (if not used by remaining components). ✅ Already handled by PR 1 rewrite — verified zero references remain.

## Phase 5: Verification

- [x] 5.1 Run `npx impeccable detect web/src/` — 1 pre-existing finding: Geist via Google Fonts flagged as `[overused-font]`. NOT introduced by P9 — documented as `/* TODO: Self-host */` in index.css (#3). Resolution deferred to self-hosting task (pre-production).
- [x] 5.2 Run `pnpm run test` — 51 test files, 211 tests all passing.
- [x] 5.3 Run `pnpm run build` — typecheck + vite build + SSR prerender succeeded with zero errors.
- [x] 5.4 Audit: `rg -i 'cabinet|satoshi|indigo|chartreuse' web/src/` — zero design-token matches. No old hex values remain.
