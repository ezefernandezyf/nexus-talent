## Exploration: P6 — Design Identity "The Signal" + GEO Foundation

### Current State

The project is a pure client-side React 19 SPA (Vite 6 / Tailwind 4) with zero SSR capability. Deployed to Vercel via SPA rewrites, it delivers a 17-line HTML shell with `<div id="root"></div>` to all crawlers. The GEO audit scores this at **7/100** — effectively invisible to AI systems.

The design system exists as a pragmatic but incomplete implementation of the "Precision Instrument" philosophy from DESIGN.md. Colors are hardcoded HEX values (no OKLCH), there is no formal typography scale, no token system beyond Tailwind `@theme`, and several P6-required components are missing (Badge). The landing page is purely visual (~87 words total content, no FAQ, no answer-block sections) and renders entirely client-side. Auth pages and the privacy page are standalone, the app shell uses AppLayout for authenticated routes.

### Affected Areas

| File / Area | Why Affected |
|---|---|
| `web/src/index.css` | Replace HEX with OKLCH tokens; add typography scale, radius, shadow CSS vars |
| `web/index.html` | Add OG/Twitter/Card/Canonical meta; Schema JSON-LD; `<noscript>`; fixed favicon |
| `web/vite.config.ts` | Needs SSR plugin (Vike or custom Vercel edge) |
| `vercel.json` | Needs SSR routing (no more `/* → /index.html` catch-all for public pages) |
| `web/src/features/landing/` | Full content rewrite: H1/H2/FAQ/answer blocks; add FAQ JSON-LD |
| `web/src/layouts/AppLayout.tsx` | Navigation and shell redesign |
| `web/src/features/auth/components/AuthShell.tsx` | Redesign auth pages |
| `web/src/pages/PrivacyPage.tsx` | Redesign + SSR-enable |
| `web/src/pages/AnalysisPage.tsx` | Align styles to new design tokens |
| `web/src/pages/HistoryPage.tsx`, `SettingsPage.tsx` | Align styles to new design tokens |
| `web/src/components/ui/Button.tsx` | Refresh with new design tokens |
| `web/src/components/ui/Card.tsx` | Refresh with new design tokens |
| `web/src/components/ui/Input.tsx` | Refresh with new design tokens |
| `web/src/components/ui/Modal.tsx` | Refresh with new design tokens |
| `web/src/components/ui/EmptyState.tsx` | Refresh alignment |
| `web/src/components/ui/PageHeader.tsx` | Refresh alignment |
| `web/src/components/ui/FeaturePageShell.tsx` | Refresh background/blur effects |
| `web/src/components/ui/` — new `Badge.tsx` | Create missing component |
| `web/public/robots.txt` | Add GPTBot, Claude-Web, PerplexityBot directives |
| `web/public/sitemap.xml` | Already exists, may need update |
| `web/public/llms.txt` | Create new static file |
| `web/public/favicon.ico` | Create stable favicon (no hash) |
| `web/public/og-image.png` | Create OG image asset |
| `web/src/lib/theme.tsx` | Check SSR compatibility |
| `docs/GEO-AUDIT-REPORT.md` | Reference for GEO requirements |
| `DESIGN.md` | Must be updated with new token values |

### Approaches

1. **Minimal SSR + Static GEO — Vike (vite-plugin-ssr) on public pages only**
   - Add Vike to Vite config, SSR only for `/` and `/privacy`; all app routes remain CSR
   - All GEO quick wins (meta, schema, llms.txt, robots.txt) are static/file changes
   - Design token overhaul done in-place in `index.css`
   - Pros: Fastest path to GEO score improvement; Vike integrates cleanly with Vite 6; partial SSR avoids overhauling the entire app
   - Cons: Vike adds ~50KB to bundle; need to handle client-only hydration for `/app/*`; learning curve for Vike conventions
   - Effort: High (SSR setup + content rewrite + token migration)

2. **Vercel Edge Prerendering + Static GEO**
   - Use Vercel `@vercel/og` or Edge Functions to prerender public pages
   - Keep all GEO quick wins as static files
   - No build-time SSR framework change
   - Pros: No Vike dependency; works with current Vite config; simpler
   - Cons: Vercel edge has limitations (timeout, memory); prerendered pages are not fully dynamic; preview environments may differ; less control than full SSR
   - Effort: Medium

3. **Full SSR Migration (Next.js or Remix)**
   - Migrate from Vite to Next.js App Router (or Remix)
   - Pros: Battle-tested SSR/SSG/ISR; built-in meta/sitemap; better DX for SEO
   - Cons: MAJOR re-architecture — entire router, layout, data-fetching system changes; weeks of work; blocks all other P6 work
   - Effort: Very High (out of scope for V1.1)

4. **No SSR — Maximize Static GEO (noscript + schema + meta only)**
   - Accept that crawlers see `<div id="root">` but compensate with `<noscript>`, perfect meta tags, JSON-LD, llms.txt, and rich robots.txt
   - Add `<noscript>` with 300+ words of structured HTML content
   - Pros: Zero build changes; all work is in HTML/meta/static files
   - Cons: Google may still raster-render JS, but AI crawlers (GPTBot, Claude-Web) will NOT — they only parse raw HTML; score improvement limited to ~25/100 max; does NOT fix the fundamental CSR problem
   - Effort: Low

### Recommendation

**Approach 1 (Vike on public pages + static GEO quick wins)** — but split into two execution tracks:

**Track A — GEO Quick Wins (Week 1, no build changes):**
- All meta tags, schema, JSON-LD, llms.txt, robots.txt, `<noscript>` — these are independent of SSR and immediately improve the score
- Design token migration (HEX → OKLCH + CSS vars) — independent
- Component refresh — independent
- Landing content rewrite (H1/H2/FAQ/answer blocks) — can be done in React components, works with or without SSR

**Track B — SSR Enablement (Week 2, requires Vike):**
- Add Vike for SSR on `/` and `/privacy` only
- Update Vercel config for SSR routes
- Verify that landing content renders as HTML to crawlers

This split means Track A can proceed immediately without blocking on the SSR decision, and Track B is a contained addition later. If Vike proves problematic, Track A work is not wasted — the landing content + meta + schema still improve the GEO score even without SSR, and `<noscript>` provides a fallback.

**Alternative if Vike is too risky:** Approach 2 (Vercel Edge prerendering) as a fallback for Track B.

### Risks

- **SSR complexity risk**: Vike with React 19 + Vite 6 may have integration issues (Vike docs may lag behind Vite versions). Need to verify compatibility before committing.
- **Design token migration risk**: Changing from HEX to OKLCH while maintaining visual parity across dark/light modes requires careful color calculation. Any color shift will affect the entire UI — must be validated visually before shipping.
- **Name collision (non-technical)**: The GEO audit identifies 4+ entities named "Nexus Talent." This is a brand problem, not fixable in code, but the P6 scope should at minimum improve entity disambiguation via schema markup (sameAs, description, applicationCategory).
- **Preview environment SSR mismatch**: Vercel preview deployments may not match production SSR behavior — need to test SSR in production-like environment before merging.
- **Font loading**: Clash Display and Satoshi (per P6 description) are DIFFERENT fonts than the current Inter/Space Grotesk. Changing font families mid-project may cause layout shift and requires new Google Fonts imports or self-hosted fonts. Verify licensing and availability before committing.
- **Accessibility + SSR**: Any SSR implementation must handle hydration mismatches correctly, especially with framer-motion animations on the landing page.

### Ready for Proposal

**Yes.** The exploration is thorough enough to commit to a recommendation. The core decision to present is:
1. Which SSR strategy (Vike on public pages vs. Vercel Edge)  
2. Which font direction (keep Inter/Space Grotesk or switch to Clash Display/Satoshi)
3. Whether to split into two execution tracks (quick wins first, SSR second)

Tell the user: *"Exploration complete. We can move to Proposal with a clear picture. The key open question is SSR approach — Vike fits our stack best but has Vite 6 compatibility risk. I'll present both options in the proposal with concrete tradeoffs."*
