# App Shell (Apex) Specification

## Purpose
Define the Apex redesign of the app shell: AppLayout with Apex components, z-index enforced via CSS custom properties, canonical single Footer, and layout-matching Suspense fallback.

## Requirements

### Requirement: Apex Component Usage in AppLayout
AppLayout MUST use Apex Button, Card, and Badge components. Zero dangling legacy class references (`primary-button`, `secondary-button`, `surface-panel`, `label-chip`, etc.).

#### Scenario: AppLayout renders
- GIVEN AppLayout is rendering
- WHEN the shell mounts
- THEN all interactive elements use Apex components (`<Button>`, `<Card>`, `<Badge>`)
- AND no legacy CSS class names are present in the rendered output

### Requirement: Z-Index from CSS Custom Properties
All z-index values in layered components MUST reference `--z-*` CSS custom properties. No arbitrary `z-[N]` values.

#### Scenario: Layered element renders
- GIVEN a component with stacking context (header, sidebar, drawer, modal, toast, tooltip)
- WHEN the element renders
- THEN its z-index comes from `var(--z-*)` tokens
- AND no hardcoded Tailwind z-index values are used

### Requirement: Single Canonical Footer with Variant Prop
Exactly ONE Footer component with a `variant` prop: `"landing"` (full SEO/GEO links + copyright) and `"app"` (minimal copyright only). All duplicate Footer implementations removed.

#### Scenario: User views landing page
- GIVEN the user is on the landing page
- WHEN the Footer renders
- THEN it contains full SEO/GEO links, social links, and copyright notice
- AND the `variant="landing"` prop is used

#### Scenario: User views an app page
- GIVEN the user is on any `/app/*` route
- WHEN the Footer renders
- THEN it shows only minimal copyright text
- AND the `variant="app"` prop is used

### Requirement: AppLayout Suspense Fallback
The AppLayout Suspense boundary SHALL render a layout-matching skeleton (`AppLayoutSkeleton`), not a bare `aria-busy` div or inline text.

#### Scenario: Lazy-loaded route is loading
- GIVEN a lazy-loaded route inside AppLayout
- WHEN the route is loading
- THEN a skeleton matching the AppLayout structure (header + sidebar + content + footer) renders
- AND no bare loading div or text is shown
