# ssr-public-pages Specification

## Purpose
Server-side rendering for `/` and `/privacy` — delivering full HTML to crawlers while keeping all app routes client-side.

## Requirements

### Requirement: Vike SSR Integration
The system MUST integrate Vike (vite-plugin-ssr) with Vite 6 for SSR on `/` and `/privacy`. A compatibility verification spike MUST precede full integration. All other routes (`/app/*`, `/auth/*`) MUST remain CSR.

#### Scenario: Crawler fetches landing page
- GIVEN a crawler or `curl` requests `/`
- WHEN the server responds
- THEN the response body contains rendered HTML with H1, H2 sections, and FAQ content
- AND no client-side JavaScript is required to see the content

#### Scenario: App routes remain CSR
- GIVEN a user navigates to `/app/analysis`
- WHEN the page loads
- THEN the route is handled by the React SPA router
- AND no SSR overhead is incurred

### Requirement: Vercel Configuration
The system MUST update `vercel.json` so SSR routes (`/`, `/privacy`) are handled before the SPA catch-all rewrite (`/* → /index.html`).

#### Scenario: Vercel routes SSR pages correctly
- GIVEN the site is deployed to Vercel
- WHEN a request arrives for `/` or `/privacy`
- THEN Vercel routes it to the SSR handler, not the static SPA shell

### Requirement: Hydration Compatibility
The system MUST ensure framer-motion animations produce no hydration mismatches. If Vike verification fails, the system MUST fall back to Vercel Edge prerendering.

#### Scenario: Vike verification fails
- GIVEN the Vike + Vite 6 compatibility spike returns a failure
- WHEN the SSR implementation proceeds
- THEN Vercel Edge prerendering is used instead
- AND the same HTML content requirements are met
