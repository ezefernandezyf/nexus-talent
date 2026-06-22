# Tasks: P6 — Design Identity "The Signal" + GEO Foundation

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~670 (Track A: ~550, Track B: ~120) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (WU1+WU2+WU3) → PR 2 (WU4+WU5) → PR 3 (WU6/WU7) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

```
Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High
```

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Design Tokens + Fonts (~100 LOC) | PR 1 | Foundation — every task depends on this |
| 2 | GEO Foundation (~80 LOC) | PR 1 | Static assets, no runtime deps |
| 3 | Components Refresh (~120 LOC) | PR 1 | Badge, Button, Card, Input, Modal |
| 4 | Landing Content (~150 LOC) | PR 2 | LandingPage rewrite + FAQ |
| 5 | Layout + Navigation (~100 LOC) | PR 2 | AppLayout, MobileDrawer, Footer, nav |
| 6 | Vike SSR (~80 LOC) | PR 3 | Conditional on spike pass |
| 7 | Vercel Edge Fallback (~40 LOC) | PR 3 | Only if Vike fails |

## Phase 1: Foundation — Design Tokens & Fonts

- [x] 1.1 Install Cabinet Grotesk + Satoshi fonts — self-hosted from Fontshare via @font-face in `index.css` (not on npm/@fontsource)
- [x] 1.2 Define OKLCH color tokens in `web/src/index.css` `@theme` block with dark-first + `[data-theme="light"]`
- [x] 1.3 Define typography scale (`--font-display/heading/body/label/caption`) in `index.css`
- [x] 1.4 Define shadow + border-radius CSS vars in `index.css`
- [x] 1.5 Import fonts via `@font-face` in `index.css` (Cabinet Grotesk + Satoshi from `/public/fonts/`)
- [x] 1.6 Remove all HEX hardcodes from `index.css`, replace with token references (OKLCH + CSS vars)

## Phase 2: GEO Foundation — Static Assets

- [x] 2.1 Add 3× JSON-LD schema blocks (`Organization`, `SoftwareApplication`, `WebSite`) to `web/index.html`
- [x] 2.2 Add OG + Twitter Card meta tags, canonical link, and updated title to `web/index.html`
- [x] 2.3 Add `<noscript>` fallback block to `web/index.html`
- [x] 2.4 Create `/web/public/llms.txt` with site description and structure
- [x] 2.5 Update `/web/public/robots.txt` with GPTBot/Claude-Web/PerplexityBot directives
- [x] 2.6 Create stable `/web/public/favicon.ico` (no hash) — copied from `docs/assets/faviconreference.png`
- [x] 2.7 Create placeholder `/web/public/og-image.png` (1200×630, Indigo/Chartreuse geometry)

## Phase 3: Core — Components & Landing

- [x] 3.1 Create `web/src/components/ui/Badge.tsx` with variants (info/success/warning/error) + sizes (sm/md)
- [x] 3.2 Refresh `Button.tsx` — replace HEX with OKLCH token refs
- [x] 3.3 Refresh `Card.tsx` — replace HEX with OKLCH token refs
- [x] 3.4 Refresh `Input.tsx` — replace HEX with OKLCH token refs
- [x] 3.5 Refresh `Modal.tsx` — OKLCH tokens + SSR-safe framer-motion gate
- [x] 3.6 Rewrite `LandingPage.tsx` with H1 + H2 answer blocks + FAQ + CTAs, 300+ words
- [x] 3.7 Create `FAQ.tsx` accordion component with 5–8 Q&A pairs
- [x] 3.8 Update `AppLayout.tsx` — OKLCH tokens for header, sidebar, content
- [x] 3.9 Update MobileDrawer — new nav copy, OKLCH tokens
- [x] 3.10 Update Footer — OKLCH tokens, typography scale match
- [x] 3.11 Update navigation — token refs, active states, design identity

## Phase 4: SSR — Vike or Edge Fallback (Week 2)

- [x] 4.1 Compatibility spike: add `vike` dependency, attempt build with Vite 6 — **FAILED: Vike 0.4.259 requires Vite >=7.1, we're on Vite 6.4.3**
- [ ] 4.2 If Vike green: create `web/renderer/+config.ts`, `+onRenderHtml.tsx`, `+onRenderClient.tsx` — **SKIPPED (Vike incompatible)**
- [ ] 4.3 Create Vike pages: `web/pages/index/+Page.tsx`, `web/pages/privacy/+Page.tsx` — **SKIPPED (Vike incompatible)**
- [x] 4.4 Update `vercel.json` — SSR routes (`/`, `/privacy`) before SPA catch-all
- [x] 4.5 Gate framer-motion animations behind `typeof window !== "undefined"` for hydration
- [x] 4.6 Vike failed → created build-time prerenderer: `web/ssr/renderer.tsx` + `web/scripts/prerender.mjs` + dev SSR middleware in `vite.config.ts`
- [x] 4.7 Verify SSR: `curl / | grep "<h1>"` returns rendered content — **PASS: landing.html has "Transform Job Descriptions", privacy.html has "Privacidad"**

## Phase 5: Testing & Verification

- [ ] 5.1 Unit: Badge variant rendering — Vitest + RTL
- [ ] 5.2 Visual: Token migration parity — screenshot diff HEX vs OKLCH
- [x] 5.3 Integration: `curl /` — verify H1, H2 blocks, FAQ in HTML source
- [ ] 5.4 GEO: Validate JSON-LD against schema.org/Google Rich Results
- [ ] 5.5 E2E: Landing renders with JS disabled — Playwright `javaScriptEnabled: false`
- [ ] 5.6 WCAG: Keyboard focus indicators, color contrast ≥ 4.5:1, `prefers-reduced-motion`

