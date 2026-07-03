# Auth Shell (Apex) Specification

## Purpose
Define the Apex redesign of authentication pages: unified AuthShell with Apex identity using Deep Teal + Amber OKLCH palette, Switzer + Geist typography, and Apex Card components.

## Requirements

### Requirement: AuthShell Apex Identity
AuthShell MUST use Apex identity: Deep Teal + Warm Amber OKLCH colors, Switzer display font + Geist body font. No glass-panel or ghost-frame legacy classes. Brand element MUST Link to `/`.

#### Scenario: User visits sign-in page
- GIVEN the user navigates to `/auth/sign-in`
- WHEN AuthShell renders
- THEN the shell uses Apex components (`<Card variant="elevated">`, `<Button>`, etc.)
- AND the brand link points to `/`
- AND no `glass-panel`, `ghost-frame`, or `ghost-border` classes are present

### Requirement: Unified AuthShell Layout
Sign-in, sign-up, and OAuth callback pages SHALL all share the same AuthShell layout with a `mode` prop.

#### Scenario: User navigates between auth pages
- GIVEN the user is on any auth page
- WHEN the page renders
- THEN the same AuthShell layout wraps the content
- AND the shell adapts content via its `mode` prop
