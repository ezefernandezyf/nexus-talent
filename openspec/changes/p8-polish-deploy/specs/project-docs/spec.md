# Project Documentation Specification

## Purpose

Define the DESIGN.md design system document (based on portfolio-personality anti-convergence principles) and the README.md rewrite covering stack, architecture, run commands, and deploy guide.

## Requirements

### Requirement: DESIGN.md - Design System Documentation

The project MUST include a `DESIGN.md` at the repo root documenting "The Signal" design system. It MUST cover palette, typography, spacing, component patterns, and dark/light strategy, following portfolio-personality anti-convergence principles.

#### Scenario: DESIGN.md covers required sections

- GIVEN a developer opens DESIGN.md
- WHEN they read the document
- THEN it MUST document the Indigo/Chartreuse OKLCH palette with color roles
- AND it MUST document Cabinet Grotesk (display) + Satoshi (body) with fallback stacks
- AND it MUST document spacing scale, radii, and shadow tokens
- AND it MUST document component patterns: buttons, cards, inputs, modals
- AND it MUST include dark-first strategy with light variant rules
- AND it MUST reference portfolio-personality anti-convergence rationale

#### Scenario: DESIGN.md is actionable

- GIVEN a new team member reads DESIGN.md
- WHEN they build a new component
- THEN the document MUST provide enough information to apply the design system
- AND tokens referenced in the doc MUST match the actual `@theme` values

### Requirement: README.md Rewrite

The project `README.md` MUST be rewritten to reflect the current stack, architecture, run commands, and deploy setup. It MUST remove outdated references to pre-monorepo or pre-migration setup.

#### Scenario: README shows current stack

- GIVEN a developer reads README.md
- WHEN they scroll to the stack section
- THEN React 19, Express 5, Prisma 7, TanStack Query, Zustand, Playwright MUST be listed

#### Scenario: README includes run commands

- GIVEN a developer wants to run the project locally
- WHEN they follow the README
- THEN `pnpm install`, `pnpm run dev:server`, `pnpm run dev:web` MUST be documented
- AND the monorepo workspace structure (`server/`, `web/`, `shared/`, `e2e/`) MUST be explained

#### Scenario: README includes deploy guide

- GIVEN a developer wants to deploy
- WHEN they read the deploy section
- THEN Vercel + Render setup MUST be documented
- AND environment variables required for production MUST be listed
