# Design System — "The Signal"

> Design identity for Nexus Talent. Dark-first, OKLCH-native, Indigo + Chartreuse palette.
> Inspired by portfolio-personality Estilo B (Minimal/Elegant) with anti-convergence principles.

---

## Table of Contents

- [Anti-Convergence Rationale](#anti-convergence-rationale)
- [Dark-First Strategy](#dark-first-strategy)
- [Color Palette](#color-palette)
- [Typography](#typography)
- [Spacing & Radii](#spacing--radii)
- [Shadows](#shadows)
- [Component Patterns](#component-patterns)
- [Light Mode](#light-mode)

---

## Anti-Convergence Rationale

Portfolio-personality skill defines **distributional convergence** as the core problem with LLM-generated
designs: statistical averaging toward the most generic center. Nexus Talent avoids this by:

| Anti-Pattern | Why We Reject It | Our Choice |
|---|---|---|
| Inter/Roboto as default font | Statistical center of LLM training data | **Cabinet Grotesk** (display) + **Satoshi** (body) — paired from Fontshare with distinct character |
| Violet/blue gradients on white | Generic AI look | **OKLCH Indigo (#5B4BFF)** + **Chartreuse (#C8F542)** — saturated pair on dark canvas |
| Sky-blue auth backgrounds | Every SaaS uses it | Deep Space (`oklch(0.12 0.01 255)`) gradient shell with subtle glow |
| Grid of identical cards | No hierarchy, no story | Glass-panel cards with depth: `backdrop-filter: blur(24px)`, layered shadows |
| Fade-in everything | Animation without purpose | Purposeful transitions: hover lifts (translateY -1px), glow-pulse on interactive elements |
| "Hi, I'm [Name]" hero | Zero differentiation | Structured landing: Hero → What Is → How It Works → Features → FAQ → CTA, built for GEO citability |

**The 3-second rule**: In 3 seconds, a visitor must know Nexus Talent is a precision AI recruiting tool
with a bold, intentional design — not another generic SaaS.

---

## Dark-First Strategy

Nexus Talent is designed **dark-first**: the dark palette is the default and receives the most
design attention. Light mode is a derived variant, not an inversion.

- Default `color-scheme: dark` in `<html>`
- Background: Deep Space — radial gradients from Indigo/Chartreuse on near-black canvas
- Light mode is activated via `data-theme="light"` on `<html>`
- Light mode redeclares surface/brand/semantic tokens with adjusted luminance
- All `@layer components` classes have `html[data-theme="light"]` overrides
- Decorative elements (gradient shells, grid overlays) are toned down but preserved
- `prefers-reduced-motion` disables all animations

---

## Color Palette

All colors defined as OKLCH tokens in `@theme` with exact interoperability. Hex values are approximate sRGB conversions.

### Brand — Indigo + Chartreuse

| Token | OKLCH | Hex (approx) | Role |
|---|---|---|---|
| `--color-primary` | `oklch(0.55 0.22 270)` | `#5B4BFF` | Primary action, links, interactive focus |
| `--color-primary-container` | `oklch(0.53 0.18 270)` | `#5C50E2` | Primary button gradient end |
| `--color-accent` | `oklch(0.92 0.19 130)` | `#C8F542` | Accent, highlights, decorative elements |
| `--color-accent-container` | `oklch(0.82 0.15 130)` | `#A4D933` | Accent backgrounds |
| `--color-on-primary` | `oklch(0.96 0.01 270)` | `#EDEDFE` | Text on primary |
| `--color-on-accent` | `oklch(0.15 0.01 130)` | `#1A2E06` | Text on accent |

### Surface — Deep Space (Dark)

| Token | OKLCH | Hex (approx) | Role |
|---|---|---|---|
| `--color-surface` | `oklch(0.12 0.01 255)` | `#1A1B23` | Default surface |
| `--color-surface-container-lowest` | `oklch(0.12 0.01 255)` | `#1A1B23` | Lowest elevation (page background) |
| `--color-surface-container-low` | `oklch(0.14 0.012 258)` | `#1E202A` | Card backgrounds |
| `--color-surface-container` | `oklch(0.18 0.01 260)` | `#272935` | Elevated surfaces |
| `--color-surface-container-high` | `oklch(0.22 0.012 258)` | `#313342` | High elevation |
| `--color-surface-container-highest` | `oklch(0.28 0.012 260)` | `#3F4152` | Highest elevation |
| `--color-surface-bright` | `oklch(0.16 0.01 260)` | `#222433` | Bright variant |
| `--color-on-surface` | `oklch(0.9 0.01 266)` | `#E2E3EB` | Primary text on surface |
| `--color-on-surface-variant` | `oklch(0.76 0.015 260)` | `#B5B8CA` | Secondary text |
| `--color-outline-variant` | `oklch(0.34 0.02 250)` | `#4F5268` | Subtle borders, dividers |

### Semantic

| Token | OKLCH | Hex (approx) | Role |
|---|---|---|---|
| `--color-success` | `oklch(0.72 0.14 150)` | `#68D98A` | Success states |
| `--color-warning` | `oklch(0.82 0.1 80)` | `#E8C447` | Warning states |
| `--color-error` | `oklch(0.65 0.18 30)` | `#D9534F` | Error states |

---

## Typography

### Font Stack

| Role | Font | Fallback | Source |
|---|---|---|---|
| Display / Headings | **Cabinet Grotesk** | Inter, sans-serif | [Fontshare](https://www.fontshare.com/) (self-hosted) |
| Body / Labels | **Satoshi** | Inter, Segoe UI, sans-serif | [Fontshare](https://www.fontshare.com/) (self-hosted) |
| Mono | **JetBrains Mono** | monospace | Google Fonts |

### Font Weights

| Weight | Cabinet Grotesk | Satoshi |
|---|---|---|
| 300 (Light) | ✓ | ✓ |
| 400 (Regular) | ✓ | ✓ |
| 500 (Medium) | ✓ | ✓ |
| 700 (Bold) | ✓ | ✓ |
| 800 (Extra Bold) | ✓ | — |
| 900 (Black) | ✓ | ✓ |

All `@font-face` declarations use `font-display: swap` to prevent invisible text during load.

### CSS Variables

```css
--font-sans: "Satoshi", "Inter", "Segoe UI", sans-serif;
--font-display: "Cabinet Grotesk", "Inter", sans-serif;
--font-heading: "Cabinet Grotesk", "Inter", sans-serif;
--font-body: "Satoshi", "Inter", sans-serif;
--font-label: "Satoshi", sans-serif;
--font-caption: "Satoshi", sans-serif;
--font-mono: "JetBrains Mono", monospace;
```

---

## Spacing & Radii

The project uses Tailwind's default spacing scale (0.25rem increments). Common distances:

| Token | Value | Usage |
|---|---|---|
| `p-6` | 1.5rem | Section padding |
| `p-8` / `p-10` | 2rem / 2.5rem | Card interior padding |
| `gap-3` | 0.75rem | Form field spacing |
| `gap-4` | 1rem | Section gaps |
| `gap-8` | 2rem | Footer link spacing |
| `space-y-4` / `space-y-6` | — | Vertical form rhythm |

### Border Radius Tokens

```css
--radius-sm: 0.5rem;      /* Small surfaces */
--radius-md: 0.75rem;     /* Default card radius */
--radius-lg: 1rem;        /* Large panels */
--radius-xl: 1.25rem;     /* Surface panel, modals */
--radius-full: 9999px;    /* Chips, pills, badges */
```

---

## Shadows

```css
--shadow-sm: 0 1px 2px oklch(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px oklch(0 0 0 / 0.1), 0 4px 6px -4px oklch(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px oklch(0 0 0 / 0.1), 0 8px 10px -6px oklch(0 0 0 / 0.1);
--shadow-glow: 0 0 20px oklch(0.55 0.22 270 / 0.3);  /* Indigo glow for interactive elements */
```

---

## Component Patterns

### Buttons

**Primary Button** (`.primary-button`):
- Gradient: `linear-gradient(135deg, var(--color-primary-container), var(--color-primary))`
- Border radius: `0.9rem` (14.4px)
- Indigo glow shadow: `0 14px 36px` at 24% opacity of primary
- Inner highlight: `inset 0 1px 0` white at 32%
- Hover: translateY(-1px), brightness 1.04
- Disabled: opacity 0.62, cursor not-allowed
- Focus: 4px primary ring at 14% + 1px primary border at 90%

**Secondary Button** (`.secondary-button`):
- Background: primary at 4% opacity
- Ghost border: `inset 0 0 0 1px` white at 8%
- Color: `var(--color-primary)`
- Hover: translateY(-1px), background to 8%
- Focus: same ring system as primary

**Tertiary Button** (`.tertiary-button`):
- Transparent background
- Text: `var(--color-on-surface-variant)`
- Hover: white bg at 5%, text to `var(--color-on-surface)`
- Compact padding: 0.72rem 0.95rem

### Cards

**Surface Panel** (`.surface-panel`):
- Border radius: `1.25rem` (--radius-xl)
- Background: surface-container at 92% opacity
- Backdrop filter: `blur(24px)` — glass morphism
- Inner border: `inset 0 0 0 1px` white at 6%
- Shadow: `0 28px 72px` black at 34%
- Light mode: white at 86%, inner border on-surface at 8%

**Ghost Frame** (`.ghost-frame`):
- Minimal: `inset 0 0 0 1px` white at 15%
- Used for subtle containment without full panel

**Card Component** (`<Card>`):
- Base: `rounded-xl`, background tone via `tone` prop
- `tone="surface"`: `bg-surface-container` (default)
- `tone="low"`: `bg-surface-container-low`
- `tone="lowest"`: `bg-surface-container-lowest`

### Inputs (`.field-surface`)

- Border radius: `0.95rem`
- Background: `var(--color-surface-container-lowest)`
- Ghost border: `inset 0 0 0 1px` white at 8%
- Focus: primary-colored border at 95% + 4px primary ring at 14%
- Select/option: inherits surface background, text color
- Transition: box-shadow and background-color 160ms ease

### Chips / Badges

**Label Chip** (`.label-chip`):
- Border radius: `9999px` (full pill)
- Background: white at 5%
- Font: label family, 0.68rem, 700 weight, 0.22em letter-spacing, uppercase
- Gap: 0.4rem
- Common use: form labels, metadata tags

**Tech Chip** (`.tech-chip`):
- Same pill shape, slightly larger (0.76rem, 0.4rem padding)
- Same ghost background
- Used for: skills, tech stack tags

### Status Dot

`<span className="status-dot" />` — 0.45rem circle with currentColor glow:
- Inline-block, 999px radius
- `box-shadow: 0 0 10px currentColor`

---

## Light Mode

Light mode is a **derived variant** of the dark-first system, activated via `data-theme="light"`:

| Token | Dark (default) | Light |
|---|---|---|
| `--color-surface-container-lowest` | `oklch(0.12 0.01 255)` | `oklch(0.99 0.003 260)` |
| `--color-surface-container-low` | `oklch(0.14 0.012 258)` | `oklch(0.96 0.005 262)` |
| `--color-surface-container` | `oklch(0.18 0.01 260)` | `oklch(0.93 0.008 260)` |
| `--color-on-surface` | `oklch(0.9 0.01 266)` | `oklch(0.14 0.015 260)` |
| `--color-primary` | `oklch(0.55 0.22 270)` | `oklch(0.35 0.2 270)` (darker for contrast) |
| `--color-accent` | `oklch(0.92 0.19 130)` | `oklch(0.82 0.17 130)` (slightly subdued) |

All component-level overrides use `html[data-theme="light"]` selectors, never separate class names.
