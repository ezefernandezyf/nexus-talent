# Landing Page (Apex) Specification

## Purpose
Define the Apex redesign of the landing page: visual identity using Switzer + Geist typography, OKLCH Deep Teal + Amber palette, while preserving SEO-critical content (H1, How It Works, FAQ, CTAs).

## Requirements

### Requirement: Landing Page Apex Identity
Landing MUST use Apex identity + components. SEO-critical content (H1, H2 sections, FAQ, CTAs) SHALL be preserved per the landing-content specification.

#### Scenario: User visits the root URL
- GIVEN a visitor navigates to `/`
- WHEN the page loads
- THEN the landing renders with Switzer headings and Apex OKLCH colors
- AND all SEO content sections (How It Works, What You Get, FAQ, Bottom CTA) are preserved
- AND the CTA button points to `/auth/sign-up`
- AND the Sign In link points to `/auth/sign-in`

### Requirement: Landing Passes Design Critique
Landing MUST pass `/impeccable critique` with zero CRITICAL issues reported.

#### Scenario: Redesigned landing is reviewed
- GIVEN the redesigned landing page
- WHEN `/impeccable critique` runs against it
- THEN no CRITICAL visual or structural issues are reported
