# P11: Page Shells + UX States

## 1. ux-states (New)

| ID | Requirement | P | Scenario (GIVEN/WHEN/THEN) |
|---|---|---|---|
| UX-01 | ErrorBoundary MUST render fallback UI + retry button. MUST NOT return null or redirect silently. | P0 | GIVEN component throws — THEN fallback UI with error + Retry renders. |
| UX-02 | /app/analysis, /app/history, /app/history/:id, /app/settings SHALL each have route-level `errorElement`. | P0 | GIVEN route crashes — THEN only route content replaced; AppLayout shell intact. |
| UX-03 | Four page-specific Skeletons per page layout. Apex Skeleton only; no inline text. | P1 | GIVEN page loads — THEN skeleton matching layout renders; no old LoadingSkeleton. |
| UX-04 | Three EmptyState variants: (a) "No analysis yet" + CTA, (b) "No history found", (c) "No results for search/filter". | P1 | GIVEN data empty — THEN matching EmptyState renders. |

## 2. app-shell-apex (New)

| ID | Requirement | P | Scenario (GIVEN/WHEN/THEN) |
|---|---|---|---|
| ASH-01 | AppLayout MUST use Apex Button/Card/Badge. Zero dangling class refs. | P0 | GIVEN AppLayout renders — THEN Apex components only; no legacy classes. |
| ASH-02 | All z-index MUST reference `--z-*` CSS custom properties. No arbitrary `z-[N]` values. | P0 | GIVEN layered element — THEN z-index from `var(--z-*)`; scale enforced. |
| ASH-03 | Exactly ONE Footer with two variants: landing (SEO/GEO links), app (minimal). All duplicates removed. | P0 | GIVEN landing — THEN SEO links; GIVEN /app/* — THEN minimal. |
| ASH-04 | AppLayout Suspense SHALL render layout-matching skeleton, not bare `aria-busy` div. | P1 | GIVEN lazy-load — THEN layout skeleton renders. |

## 3. auth-shell-apex (New)

| ID | Requirement | P | Scenario (GIVEN/WHEN/THEN) |
|---|---|---|---|
| AUS-01 | AuthShell MUST use Apex identity: Deep Teal+Amber OKLCH, Switzer+Geist fonts. No glass-panel/ghost-frame. Brand element MUST Link to `/`. | P0 | GIVEN /auth/sign-in — THEN Apex components + OKLCH; brand links to `/`. |
| AUS-02 | Sign-in, sign-up, OAuth callback SHALL share unified AuthShell layout. | P1 | GIVEN any auth page — THEN same shell layout. |

## 4. landing-apex (New)

| ID | Requirement | P | Scenario (GIVEN/WHEN/THEN) |
|---|---|---|---|
| LAN-01 | Landing MUST use Apex identity + components. SEO-critical content (H1/H2/FAQ/CTAs) SHALL be preserved per landing-content spec. | P1 | GIVEN `/` loads — THEN Apex identity; SEO content preserved. |
| LAN-02 | Landing MUST pass `/impeccable critique` with zero CRITICAL issues. | P1 | GIVEN redesigned page — WHEN critique runs — THEN no CRITICAL issues reported. |

## 5. ui-shell (Modified)

| ID | Requirement | P | Scenario (GIVEN/WHEN/THEN) |
|---|---|---|---|
| USH-M01 | Global Footer → superseded by ASH-03 canonical Footer. (Previously: Signal identity footer with 3 implementations.) | P0 | GIVEN any page — THEN single Footer; old implementations removed. |
| USH-M02 | Mobile Drawer MUST use `--z-drawer` token, not hardcoded z-40. (Previously: hardcoded z-40, conflict with account menu.) | P0 | GIVEN drawer + account menu open — THEN distinct `--z-*` tokens; no stacking conflicts. |
| USH-M03 | Nav labels SHALL use Switzer font + Apex accent active color. (Previously: Cabinet Grotesk + Signal identity.) | P1 | GIVEN nav renders — THEN Switzer labels; active state uses OKLCH accent token. |

## 6. design-tokens (Modified)

| ID | Requirement | P | Scenario (GIVEN/WHEN/THEN) |
|---|---|---|---|
| DTK-A01 | ADDED: Z-index enforced via `var(--z-*)` for all layered components. | P0 | GIVEN elevated component — THEN z-index from CSS custom property, not hardcoded Tailwind. |
| DTK-M01 | Typography: Switzer (display/heading) + Geist (body/label/caption). (Previously: Cabinet Grotesk + Satoshi.) | P1 | GIVEN any page — THEN headings=Switzer, body=Geist; no Cabinet Grotesk/Satoshi in output. |

## 7. ui-parity (Modified)

| ID | Requirement | P | Scenario (GIVEN/WHEN/THEN) |
|---|---|---|---|
| UIP-M01 | Loading states MUST use Apex Skeleton. Old LoadingSkeleton + inline text removed. (Previously: unspecified skeleton loader.) | P1 | GIVEN async operation loading — THEN Apex Skeleton renders; no legacy skeletons or raw text. |
| UIP-M02 | Surface separation SHALL use Apex Card elevation. No 1px solid borders. (Previously: Ghost Border + surface-panel; now Apex Card.) | P1 | GIVEN content panel — THEN Apex Card backgrounds; zero solid borders on containers. |

## 8. ui (Modified)

| ID | Requirement | P | Scenario (GIVEN/WHEN/THEN) |
|---|---|---|---|
| UI-M01 | Landing layout MUST use Apex identity. Routes: CTA→/auth/sign-up, login→/auth/sign-in. (Previously: Signal identity, `/login`+`/signup`.) | P1 | GIVEN `/` loads — THEN Switzer headings, Apex buttons; correct route paths. |
| UI-A01 | ADDED: Zero dangling class refs (primary-button, secondary-button, surface-panel, label-chip, tech-chip, ghost-frame, field-surface) in web/src/. | P0 | GIVEN text search of web/src/ — THEN zero matches for legacy class names in .tsx/.css. |
| UI-R01 | REMOVED: Badge Component spec — superseded by P10 Apex Badge. (Migration: use shared `<Badge>` from P10.) | P2 | — |
