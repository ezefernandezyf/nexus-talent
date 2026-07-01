# Design System Foundation

## Requirements

| # | Requirement | Scenario |
|---|------------|----------|
| DSF-1 | `/impeccable init` MUST generate PRODUCT.md + DESIGN.md with taste-skill identity. Zero carry-over from Indigo/Chartreuse/Cabinet Grotesk/Satoshi. | **GIVEN** no identity docs **WHEN** init runs **THEN** both exist with new identity, no "Signal" references. |
| DSF-2 | All tokens MUST be CSS custom properties in Tailwind 4 `@theme`. Colors SHALL be OKLCH-only. | **GIVEN** CSS loaded **WHEN** inspecting styles **THEN** colors use `oklch()` syntax; `text-primary` resolves from tokens. |
| DSF-3 | CSS reset in `@layer base`: border-box, zero heading margins, list-style none, img block+max-width, form font inheritance, link underline. | **GIVEN** page renders **WHEN** inspecting H1 **THEN** margins zeroed; body/input/select/textarea share font-family. |
| DSF-4 | Fluid `clamp()` type scale: display, heading-1..6, body, caption, label. Taste-skill fonts only. Inter/Roboto/Arial/Cabinet Grotesk/Satoshi EXCLUDED. | **GIVEN** viewports 320-1440px **WHEN** rendering display **THEN** size scales via clamp(); no overflow. |
| DSF-5 | OKLCH palette: brand, surface (≥5 levels), semantic (success/warning/error/info), on-* contrast. Dark default; light via `[data-theme="light"]`. Both modes MUST have token parity + WCAG AA contrast. | **GIVEN** no `data-theme` **WHEN** page renders **THEN** dark tokens active, 5 surfaces distinct. **GIVEN** `data-theme="light"` **THEN** light tokens, body contrast ≥4.5:1. |
| DSF-6 | Scales: spacing, radius (sm→full), shadow (elevation+glow), z-index (base/dropdown/sticky/modal/toast/tooltip). Duration+easing tokens SHOULD be included. | **GIVEN** modal+toast+dropdown **WHEN** inspecting z-index **THEN** modal > toast > dropdown; no 999/9999. |
| DSF-7 | `npx impeccable detect web/src/` MUST return zero findings. Anti-patterns resolved per impeccable absolute bans. | **GIVEN** P9 complete **WHEN** detection runs **THEN** zero findings, exit 0. |
