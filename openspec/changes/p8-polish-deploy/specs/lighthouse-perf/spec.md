# Lighthouse Performance Specification

## Purpose

Define performance targets and optimization strategies so Nexus Talent achieves Lighthouse 90+ on mobile. Covers Core Web Vitals, bundle optimization, and font loading.

## Requirements

### Requirement: Core Web Vitals Targets

The application MUST meet the following Core Web Vitals thresholds on mobile (simulated Slow 4G, Moto G4): LCP < 2.5s, CLS < 0.1, and FID < 100ms.

#### Scenario: Lighthouse mobile audit passes

- GIVEN a production build deployed to Vercel preview
- WHEN Lighthouse runs a mobile audit
- THEN the Performance score MUST be ≥ 90
- AND LCP MUST be under 2.5 seconds
- AND CLS MUST be under 0.1
- AND FID MUST be under 100 milliseconds

#### Scenario: No layout shift from lazy-loaded routes

- GIVEN the user navigates between app pages
- WHEN lazy-loaded chunks resolve and render
- THEN Suspense boundaries MUST reserve space via `min-height`
- AND no cumulative layout shift MUST occur during chunk loading

### Requirement: Bundle Optimization

Application bundles MUST be split so that initial page load serves only critical-path code. Route-level code splitting via React.lazy SHALL be used for all app-shell routes.

#### Scenario: Initial bundle under size threshold

- GIVEN a production build
- WHEN the bundle is analyzed
- THEN the initial entry chunk MUST NOT include code from non-landing routes
- AND shared vendor chunks MUST be deduplicated

### Requirement: Font Loading Strategy

Web fonts (Cabinet Grotesk and Satoshi) MUST use `font-display: swap` to ensure text is visible during font load. No invisible-text period (FOIT) SHALL occur.

#### Scenario: Text visible during font load

- GIVEN the user has a slow network connection
- WHEN Cabinet Grotesk has not finished loading
- THEN text MUST render immediately with a fallback system font
- AND the swap to the custom font MUST occur without layout shift
