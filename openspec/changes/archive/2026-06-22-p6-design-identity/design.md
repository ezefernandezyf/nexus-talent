# Design: P6 - Design Identity "The Signal" + GEO Foundation

## Technical Approach

**Track A (Week 1, zero build changes):** OKLCH design tokens in Tailwind 4 `@theme`, Cabinet Grotesk + Satoshi via `@fontsource`, structured landing content (Hero→WhatIs→HowItWorks→Features→FAQ→CTA), GEO static assets (JSON-LD, OG/Twitter, llms.txt, robots.txt, noscript, favicon). Component refresh (Button, Card, Input, Modal → token references) + new Badge component.

**Track B (Week 2, conditional):** Vike SSR for `/` + `/privacy` after compatibility spike. Vercel Edge Function fallback if Vike+Vite 6 fails. All `/app/*` and `/auth/*` routes remain CSR.

## Architecture Decisions

| Decision | Choice | Why |
|---|---|---|
| Color format | OKLCH CSS vars in `@theme` | Perceptually uniform, wider gamut, dark/light parity via lightness swaps |
| Typography | Cabinet Grotesk (display) + Satoshi (body) via @fontsource | Anti-convergence per portfolio-personality Style B; avoids LLM-default Inter |
| Dark/light | Dark-first via CSS vars; light via `[data-theme="light"]` | "Deep Space" brand; CSS-only dark default works without JS |
| Execution | Two-track (Tokens+GEO first, SSR second) | Track A unblocks design immediately; SSR spike runs in parallel, no blocking |
| SSR | Vike for `/`+`/privacy`; Edge fallback | Minimal build delta; Vite-native; keeps app CSR; fallback preserves GEO wins |
| Component token ref | All components use `var(--color-*)`, zero HEX | Single source of truth; consistent theme switching; easy palette evolution |

## SSR Data Flow

```
Browser → Vercel
             ├─ /, /privacy → Vike renderToPipeableStream → HTML (H1,H2,FAQ visible)
             └─ /app/*, /auth/* → SPA catch-all → /index.html (CSR)
```

Vike `+onRenderHtml.tsx` streams React HTML with `data-theme` on `<html>`. framer-motion animations gated behind `typeof window !== "undefined"` - static content renders server-side, animations hydrate client-side with zero mismatch.

## Component Architecture

**Badge contract:** `{ variant: "info"|"success"|"warning"|"error"; size?: "sm"|"md"; icon?: ReactNode; children }` - styled with OKLCH tokens, uses `cn()`.

**Component refresh pattern:** Replace hardcoded class references (e.g., `primary-button`, `surface-panel`) with Tailwind token utilities (`bg-primary`, `text-on-surface`, `rounded-lg`). Existing `cn()` (clsx+tailwind-merge) remains the single merger. `theme.tsx` unchanged - already toggles `data-theme` on `<html>`.

## File Changes

| File | Action | Description |
|---|---|---|
| `web/src/index.css` | Modify | HEX→OKLCH `@theme`; typography/radius/shadow tokens; @fontsource imports |
| `web/index.html` | Modify | OG/Twitter, canonical, 3×JSON-LD, noscript, favicon link |
| `web/public/llms.txt` | Create | Static AI discovery (llmstxt.org) |
| `web/public/robots.txt` | Modify | GPTBot/Claude-Web/PerplexityBot explicit allows |
| `web/public/favicon.ico` | Create | Stable favicon (no hash) |
| `web/public/og-image.png` | Create | 1200×630 placeholder |
| `web/src/components/ui/Badge.tsx` | Create | Variants + sizes + optional icon |
| `web/src/components/ui/Button.tsx` | Modify | Token refs |
| `web/src/components/ui/Card.tsx` | Modify | Token refs |
| `web/src/components/ui/Input.tsx` | Modify | Token refs |
| `web/src/components/ui/Modal.tsx` | Modify | Token refs; SSR-safe framer-motion |
| `web/src/layouts/AppLayout.tsx` | Modify | HEX→token refs |
| `web/src/features/landing/pages/LandingPage.tsx` | Modify | Hero+WhatIs+HowItWorks+Features+FAQ+CTA, 300+ words |
| `web/src/features/landing/components/FAQ.tsx` | Create | Accordion, 5-8 Q&A |
| `web/vite.config.ts` | Modify | +Vike plugin (conditional on spike) |
| `web/renderer/+config.ts` | Create | Vike: SSR on, client routing for app |
| `web/renderer/+onRenderHtml.tsx` | Create | SSR HTML streamer |
| `web/renderer/+onRenderClient.tsx` | Create | Client hydration entry |
| `web/pages/index/+Page.tsx` | Create | Vike page wrapping LandingPage |
| `web/pages/privacy/+Page.tsx` | Create | Vike page wrapping PrivacyPage |
| `vercel.json` | Modify | SSR routes before SPA catch-all |
| `web/package.json` | Modify | +`vike` dep (conditional on spike) |

## Testing Strategy

| Layer | What | How |
|---|---|---|
| Unit | Badge variants | Vitest + RTL |
| Visual | Token migration parity dark/light | Screenshot diff HEX vs OKLCH |
| Integration | SSR delivers HTML | `curl /` → verify H1, FAQ in source |
| GEO | Structured data validity | Google Rich Results Test, schema.org validator |
| E2E | Landing renders JS-disabled | Playwright `javaScriptEnabled: false` |

## Migration / Rollout

Track A deploys immediately - revert `index.css` + `index.html` undoes everything. Track B: spike first; if Vike passes, add dependency and verify with `curl`. If fails, swap to Vercel Edge Function. Rollback: `git revert` vite.config + vercel.json. No data migration.

## Open Questions

- [ ] Exact OKLCH values for Indigo/Chartreuse "Signal" palette - designer approval needed
- [ ] Vike + Vite 6 + React 19 compatibility - spike result pending (blocks Track B)
- [ ] OG image - placeholder or custom artwork? (placeholder acceptable for Week 1)
- [ ] Clash Display vs Cabinet Grotesk - exploration notes font mismatch; proposal settled on Cabinet Grotesk - confirm
