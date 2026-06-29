# SSR Public Pages Specification

## Purpose
Server-side rendering for `/` and `/privacy` - delivering full HTML to crawlers while keeping all app routes client-side.

## Requirements

### Requirement: SSR Page Serving
The system MUST deliver fully rendered HTML for `/` and `/privacy` via build-time prerendering. A compatibility verification spike for Vike MUST precede integration attempts. All other routes (`/app/*`, `/auth/*`) MUST remain CSR.

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
The system MUST ensure framer-motion animations produce no hydration mismatches. If Vike integration is incompatible, the system MUST fall back to build-time prerendering.

#### Scenario: Vike verification fails
- GIVEN the Vike + Vite 6 compatibility spike returns a failure
- WHEN the SSR implementation proceeds
- THEN build-time prerendering is used instead
- AND the same HTML content requirements are met
