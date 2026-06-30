# Design System — "Apex"

> Visual identity for Nexus Talent V1.2. Dark-first, OKLCH-native, Deep Teal + Warm Amber palette.
> Built on taste-skill dials VARIANCE: 8, MOTION: 6, DENSITY: 4. Zero carry-over from "The Signal" (V1.1).

---

## Table of Contents

- [Color Strategy](#color-strategy)
- [Dark-First Strategy](#dark-first-strategy)
- [Color Palette](#color-palette)
- [Typography](#typography)
- [Spacing](#spacing)
- [Border Radii](#border-radii)
- [Shadows & Glow](#shadows--glow)
- [Z-Index Scale](#z-index-scale)
- [Animation & Easing](#animation--easing)
- [Light Mode](#light-mode)

---

## Color Strategy

**Strategy**: Committed — one saturated color (Deep Teal) carries ~40% of interactive surfaces. Accent (Warm Amber) is used sparingly for highlights, status, and decorative emphasis. Cool-tinted neutrals provide the surface foundation.

This avoids:
- The old Indigo/Chartreuse identity (V1.1 "Signal")
- Generic AI purple/blue gradients on dark
- Warm cream/sand beige defaults
- Monochrome gray with no personality

---

## Dark-First Strategy

Nexus Talent is designed **dark-first**: the dark palette receives the primary design attention. Light mode is a derived variant with full token parity and WCAG AA contrast compliance.

- Default `color-scheme: dark` on `<html>`
- Surface base: near-black with cool blue-gray tint (`oklch(0.10 0.006 240)`)
- Light mode activated via `data-theme="light"` attribute on `<html>`
- All tokens redeclared in `[data-theme="light"]` — no hardcoded colors anywhere
- `prefers-reduced-motion` disables all animations globally
- The `text-white` light-mode override is preserved from V1.1 and marked for P10 removal

**Scene**: A recruiter at their desk late in the evening, focused on a single screen. The workspace recedes. The content leads. Dark mode is not "cool" — it's the operating environment.

---

## Color Palette

All colors are OKLCH with exact interoperability. Hex values are approximate sRGB conversions for reference only.

### Brand — Deep Teal + Warm Amber

| Token | OKLCH | Hex (approx) | Role |
|---|---|---|---|
| `--color-brand` | `oklch(0.52 0.14 220)` | `#3070B5` | Primary action, links, interactive focus |
| `--color-brand-container` | `oklch(0.44 0.12 220)` | `#255D99` | Brand backgrounds, badge fills |
| `--color-accent` | `oklch(0.72 0.14 65)` | `#E8A64C` | Highlights, decorative emphasis, info badges |
| `--color-accent-container` | `oklch(0.62 0.12 65)` | `#C98C3C` | Accent backgrounds, subtle highlights |
| `--color-on-brand` | `oklch(0.95 0.005 220)` | `#EAF0FA` | Text on brand backgrounds |
| `--color-on-accent` | `oklch(0.15 0.01 65)` | `#1F1705` | Text on accent backgrounds |

### Surface — Cool Tint (Dark)

| Token | OKLCH | Hex (approx) | Role |
|---|---|---|---|
| `--color-surface-base` | `oklch(0.10 0.006 240)` | `#15161D` | Page background, lowest elevation |
| `--color-surface-elevated-1` | `oklch(0.13 0.008 235)` | `#1A1C25` | Card backgrounds |
| `--color-surface-elevated-2` | `oklch(0.16 0.01 235)` | `#20222E` | Elevated cards, dropdowns |
| `--color-surface-elevated-3` | `oklch(0.20 0.01 235)` | `#282B38` | Modals, drawers |
| `--color-surface-elevated-4` | `oklch(0.24 0.012 235)` | `#303346` | High-evaluation tooltips, popovers |
| `--color-surface-elevated-5` | `oklch(0.29 0.012 235)` | `#3A3E52` | Highest elevation (dropdown items on hover) |
| `--color-on-surface` | `oklch(0.93 0.006 235)` | `#EAEBF0` | Primary text |
| `--color-on-surface-variant` | `oklch(0.65 0.01 235)` | `#9DA0B3` | Secondary text, placeholder |
| `--color-outline` | `oklch(0.30 0.015 235)` | `#404258` | Borders, dividers |

### Semantic

| Token | OKLCH | Hex (approx) | Role |
|---|---|---|---|
| `--color-success` | `oklch(0.65 0.15 150)` | `#47C97E` | Success states, positive indicators |
| `--color-warning` | `oklch(0.75 0.12 75)` | `#DBA641` | Warning states, attention-needed |
| `--color-error` | `oklch(0.55 0.18 25)` | `#D34B4B` | Error states, destructive actions |
| `--color-info` | `oklch(0.60 0.10 220)` | `#4A8ECB` | Informational, neutral updates |

---

## Typography

### Font Stack

| Role | Font | Fallback | Source |
|---|---|---|---|
| Display / Headings | **Switzer** | Inter, sans-serif | Google Fonts (temporary, self-host planned) |
| Body / Labels | **Geist** | Inter, Segoe UI, sans-serif | Google Fonts (temporary, self-host planned) |
| Mono | **JetBrains Mono** | monospace | Preserved from V1.1 |

### Font Weights

| Weight | Switzer | Geist | JetBrains Mono |
|---|---|---|---|
| 300 (Light) | ✓ | ✓ | — |
| 400 (Regular) | ✓ | ✓ | ✓ |
| 500 (Medium) | ✓ | ✓ | ✓ |
| 600 (Semi-Bold) | ✓ | ✓ | — |
| 700 (Bold) | ✓ | ✓ | — |
| 800 (Extra Bold) | ✓ | — | — |
| 900 (Black) | ✓ | — | — |

All `@font-face` declarations use `font-display: swap` to prevent invisible text during load. Fonts are imported via `@import url()` for the interim and must be self-hosted before production deployment (see PR 2).

### Fluid Type Scale

Uses `clamp()` for smooth scaling from 320px to 1440px viewports.

```css
--text-display: clamp(2.5rem, 4vw + 1rem, 4.5rem);    /* Hero titles, limited use */
--text-h1: clamp(2rem, 3vw + 0.5rem, 3.5rem);           /* Page headings */
--text-h2: clamp(1.5rem, 2vw + 0.25rem, 2.5rem);         /* Section headings */
--text-h3: clamp(1.25rem, 1.5vw + 0.25rem, 2rem);        /* Card headings */
--text-h4: clamp(1.1rem, 1vw + 0.25rem, 1.5rem);          /* Sub-headings */
--text-body: clamp(0.875rem, 0.5vw + 0.75rem, 1rem);       /* Body text */
--text-caption: clamp(0.75rem, 0.25vw + 0.7rem, 0.875rem);  /* Labels, metadata */
--text-label: 0.68rem;                                        /* UI labels, chip text — fixed */
```

Headings use `text-wrap: balance`. Body text uses `text-wrap: pretty`. Body line length capped at 65ch.

---

## Spacing

The project uses a custom spacing scale via `@theme`:

| Token | Value | Typical Usage |
|---|---|---|
| `--spacing-1` | 0.25rem | Micro adjustments |
| `--spacing-2` | 0.5rem | Inner element gaps |
| `--spacing-3` | 0.75rem | Form field spacing |
| `--spacing-4` | 1rem | Base unit |
| `--spacing-5` | 1.25rem | Button padding |
| `--spacing-6` | 1.5rem | Card internal padding |
| `--spacing-8` | 2rem | Section gaps |
| `--spacing-10` | 2.5rem | Large card interior |
| `--spacing-12` | 3rem | Inter-section spacing |
| `--spacing-16` | 4rem | Page section padding |
| `--spacing-20` | 5rem | Large section padding |
| `--spacing-24` | 6rem | Hero/landing padding |
| `--spacing-28` | 7rem | Generous section padding |
| `--spacing-32` | 8rem | Maximum section padding |

Section gaps use `py-16` to `py-24` as standard. Landing sections use `py-24` to `py-32`.

---

## Border Radii

```css
--radius-sm: 0.5rem;      /* Secondary surfaces */
--radius-md: 0.75rem;     /* Default card radius */
--radius-lg: 1rem;        /* Large panels */
--radius-xl: 1.25rem;     /* Surface panel, modals */
--radius-full: 9999px;    /* Chips, pills, badges */
```

All radii consistent across both modes. No `rounded-full` on large containers or primary buttons (except chips/badges).

---

## Shadows & Glow

```css
--shadow-sm: 0 1px 2px oklch(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px oklch(0 0 0 / 0.1), 0 4px 6px -4px oklch(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px oklch(0 0 0 / 0.1), 0 8px 10px -6px oklch(0 0 0 / 0.1);
--shadow-glow: 0 0 20px oklch(0.52 0.14 220 / 0.3);  /* Brand glow for interactive elements */
```

Shadow opacity values are kept low for subtle depth. The `--shadow-glow` is reserved for primary interactive elements with intentional emphasis.

---

## Z-Index Scale

```css
--z-base: 1;
--z-dropdown: 10;
--z-sticky: 20;
--z-modal-backdrop: 30;
--z-modal: 40;
--z-toast: 50;
--z-tooltip: 60;
```

No arbitrary `z-50` or `z-9999` values. Every z-index assignment uses these tokens.

---

## Animation & Easing

```css
--duration-fast: 150ms;     /* Hover states, micro-interactions */
--duration-normal: 250ms;   /* Standard transitions */
--duration-slow: 400ms;     /* Panel open/close, large transitions */
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
```

The `--ease-out-expo` curve is the default easing for all purposeful transitions. It provides a natural deceleration feel without overshoot. Animations use only `transform` and `opacity` — never layout-triggering properties.

Under `prefers-reduced-motion: reduce`, all animations collapse to instant state changes (`transition-duration: 0ms`).

---

## Light Mode

Light mode is activated via `data-theme="light"` on `<html>`. All tokens are redeclared in this variant with adjusted luminance for WCAG AA contrast compliance.

| Token | Dark (default) | Light |
|---|---|---|
| `--color-surface-base` | `oklch(0.10 0.006 240)` | `oklch(0.99 0.003 240)` |
| `--color-surface-elevated-1` | `oklch(0.13 0.008 235)` | `oklch(0.97 0.005 240)` |
| `--color-surface-elevated-2` | `oklch(0.16 0.01 235)` | `oklch(0.94 0.008 240)` |
| `--color-surface-elevated-3` | `oklch(0.20 0.01 235)` | `oklch(0.90 0.01 240)` |
| `--color-surface-elevated-4` | `oklch(0.24 0.012 235)` | `oklch(0.86 0.012 240)` |
| `--color-surface-elevated-5` | `oklch(0.29 0.012 235)` | `oklch(0.82 0.014 240)` |
| `--color-brand` | `oklch(0.52 0.14 220)` | `oklch(0.35 0.14 220)` |
| `--color-accent` | `oklch(0.72 0.14 65)` | `oklch(0.62 0.14 65)` |
| `--color-on-surface` | `oklch(0.93 0.006 235)` | `oklch(0.15 0.008 240)` |
| `--color-on-surface-variant` | `oklch(0.65 0.01 235)` | `oklch(0.45 0.01 240)` |

Light mode is not an afterthought — all component overrides use `html[data-theme="light"]` selectors with full token parity. Body text contrast targets ≥4.5:1 in both modes.
