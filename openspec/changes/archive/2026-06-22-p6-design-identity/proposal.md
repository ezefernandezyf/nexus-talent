# Proposal: P6 - Design Identity "The Signal" + GEO Foundation

## Intent

CSR SPA → AI crawlers see `<div id="root">`. GEO score: **7/100**. Design uses HEX colors, Inter/Space Grotesk, no token system. Landing has ~87 words - no answer blocks, FAQ, or structured AI-citable content.

## Scope

**In:** SSR for `/` + `/privacy` (Vike first, Vercel Edge fallback). OKLCH tokens + typography scale. Cabinet Grotesk (display) + Satoshi (body) via @fontsource. Component refresh (Button, Card, Input, Modal, Badge). Layout + nav redesign. Landing rewrite: H1 + H2 answer blocks + FAQ 5–8 Q&A, 300+ words. GEO quick wins: OG/Twitter meta, Schema JSON-LD, llms.txt, robots.txt (GPTBot/Claude-Web/PerplexityBot), noscript, canonical, favicon, og-image. DESIGN.md update.

**Out:** Full app SSR, Next.js/Remix migration, brand disambiguation.

## Capabilities

**New:** `design-tokens` (OKLCH colors, typography scale, shadow/radius CSS vars), `geo-foundation` (meta, Schema, llms.txt, robots.txt, noscript, canonical), `ssr-public-pages` (Vike SSR for `/` + `/privacy`, includes Vike × Vite 6 verification gate), `landing-content` (H1/H2/answer-block/FAQ, 300+ words, English, CTAs).

**Modified:** `ui` (landing + auth pages redesigned), `ui-shell` (nav + footer redesigned), `landing-mobile-drawer` (content matches new copy).

## Approach

**Track A - GEO + Tokens (Week 1):** Install fonts, rewrite index.css (HEX → OKLCH, swap fonts), update index.html (meta, Schema, noscript), create llms.txt/robots.txt/favicon/og-image, rewrite landing content, refresh all UI components, redesign AppLayout + AuthShell + footer.

**Track B - SSR (Week 2):** Vike × Vite 6 compatibility spike. If green: add Vike, SSR-enable `/` and `/privacy`, update vercel.json. If fails: swap to Vercel Edge prerendering. Verify hydration + dark mode parity.

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Vike + Vite 6 incompatibility | Medium | Spike before full commit; Edge fallback |
| OKLCH color shift dark/light | Medium | Visual validation before shipping |
| SSR hydration w/ animations | Low | Defer framer-motion to client |
| Font CLS | Low | @fontsource preloads, subset fonts |

## Rollback

Track A: revert `index.css` + `index.html`, uninstall fonts, restore components. Track B: `git revert` vite.config.ts + vercel.json → CSR rewrites restore SPA.

## Dependencies

Vike × Vite 6 + React 19 compatibility (verify in spike). @fontsource/cabinet-grotesk + @fontsource/satoshi.

## Success Criteria

- [ ] GEO re-audit ≥ 35/100 (baseline: 7)
- [ ] `curl` landing → full HTML (no JS): H1, H2 blocks, FAQ, 300+ words
- [ ] Zero HEX hardcodes - all components use OKLCH tokens
- [ ] Dark/light parity across all pages
- [ ] Fonts load without CLS
- [ ] `/` and `/privacy` deliver SSR HTML; app routes remain CSR
