# Design Identity Specification

## Purpose

Align the AuthShell component to "The Signal" design system: replace legacy sky-blue gradients with Indigo/Chartreuse OKLCH tokens, remove all Supabase references from copy, and apply Cabinet Grotesk for headings. Visual-only changes - auth flow logic MUST remain unchanged.

## Requirements

### Requirement: AuthShell Indigo/Chartreuse Palette

The AuthShell MUST replace all sky-blue gradient backgrounds with Indigo/Chartreuse OKLCH tokens defined in the design system. The radial gradients and grid pattern SHALL use the Indigo and Chartreuse color stops.

#### Scenario: Auth page renders with The Signal palette

- GIVEN the user visits `/auth/sign-in` or `/auth/sign-up`
- WHEN the AuthShell renders
- THEN decorative gradients MUST use Indigo/Chartreuse OKLCH values
- AND the background MUST derive from `--color-surface-container-lowest`
- AND no `rgba(142, 213, 255, ...)` or `rgba(56, 189, 248, ...)` values SHALL remain

#### Scenario: Dark mode still applies

- GIVEN the user has dark theme active
- WHEN the AuthShell renders
- THEN the Indigo/Chartreuse gradients MUST be visible and legible against the dark surface
- AND text contrast MUST meet WCAG AA (≥ 4.5:1)

### Requirement: Remove Supabase References

The AuthShell copy MUST NOT reference Supabase. All AUTH_SHELL_COPY strings that mention "Supabase Auth", "RLS", or Supabase-specific concepts SHALL be replaced with backend-agnostic JWT/auth wording.

#### Scenario: Sign-in page shows no Supabase wording

- GIVEN the user visits `/auth/sign-in`
- WHEN the AuthShell renders
- THEN the subtitle MUST NOT mention "Supabase"
- AND the stats list MUST NOT include "RLS mínima"
- AND the copy MUST reference JWT-based session persistence

#### Scenario: Sign-up page shows no Supabase wording

- GIVEN the user visits `/auth/sign-up`
- WHEN the AuthShell renders
- THEN the subtitle MUST NOT mention "Supabase Auth"
- AND the stats list MUST be updated to reflect JWT-only auth

### Requirement: Auth Flow Preserved

The auth flow (login, register, OAuth redirect, callback) MUST remain functional after the AuthShell visual redesign. No DOM structure changes that affect form submission or OAuth button behavior SHALL be made.

#### Scenario: Login still works after redesign

- GIVEN the AuthShell has been redesigned
- WHEN the user submits valid credentials
- THEN the login request MUST succeed
- AND the session cookie MUST be set
- AND the user MUST be redirected to `/app`
