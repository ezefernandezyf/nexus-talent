# design-tokens Specification

## Purpose
OKLCH-based design token system replacing all hardcoded HEX values. Single source of truth for colors, typography, shadows, radii, spacing.

## Requirements

### Requirement: OKLCH Color Tokens
The system MUST define all colors as OKLCH CSS custom properties within Tailwind 4 `@theme`. Dark theme MUST be the default; light variant MUST activate via `[data-theme="light"]` on `<html>`.

#### Scenario: Dark theme applies by default
- GIVEN a user visits any page
- WHEN the page renders
- THEN all colors derive from OKLCH custom properties
- AND the dark palette is active without JavaScript

### Requirement: Typography Scale
The system SHALL define a semantic typography scale (`--font-display`, `--font-heading`, `--font-body`, `--font-label`, `--font-caption`) using Cabinet Grotesk for display/headings and Satoshi for body, loaded via `@fontsource`.

#### Scenario: Fonts render correctly
- GIVEN the fonts are installed via @fontsource
- WHEN any page renders
- THEN Cabinet Grotesk applies to headings and display text
- AND Satoshi applies to body, labels, and captions
- AND no layout shift occurs during font loading

### Requirement: Shadow and Radius Tokens
The system MUST define shadow and border-radius tokens as CSS custom properties with dark/light variants.

#### Scenario: Shadows adapt to theme
- GIVEN the user switches between dark and light themes
- WHEN the theme changes
- THEN shadow tokens update to match the active palette
- AND radius tokens remain consistent across themes
