# Button Specification

## Purpose
Interactive button with 4 variants, 3 sizes, icon support, full state coverage. Apex OKLCH tokens, Switzer labels, Geist auxiliary text.

## Requirements

| ID | Requirement | Priority | RFC 2119 |
|----|------------|----------|----------|
| BTN-01 | Variants: primary (`--color-brand`), secondary (`--color-outline`), ghost (transparent), danger (`--color-error`) | P0 | MUST |
| BTN-02 | Sizes: sm (h-8 px-3 text-sm), md (h-10 px-5 text-base), lg (h-12 px-6 text-lg) | P0 | MUST |
| BTN-03 | States: default, hover (luminance +0.08), focus-visible (2px brand ring offset-2), active (scale-[0.97]), disabled (opacity-50 pointer-events-none), loading (spinner + disabled) | P0 | MUST |
| BTN-04 | Icons: prefix/suffix via `iconPrefix`/`iconSuffix` props, `@phosphor-icons/react`, gap-2 | P1 | SHOULD |
| BTN-05 | Dark/light: both modes via Apex tokens, light via `html[data-theme="light"]`, contrast ≥ 4.5:1 | P0 | MUST |
| BTN-06 | Typography: Switzer 500 weight, no uppercase tracking, no em-dashes | P0 | MUST |
| BTN-07 | Radius: `--radius-md` (0.75rem), uniform across variants | P1 | SHOULD |
| BTN-08 | Reduced motion: all transitions collapse to instant under `prefers-reduced-motion` | P0 | MUST |

### Scenario: Primary button renders with brand color
- GIVEN `<Button variant="primary">Submit</Button>`
- WHEN rendered in dark mode
- THEN bg is `--color-brand`, text is `--color-on-brand`
- AND Switzer medium renders the label

### Scenario: Button in loading state blocks interaction
- GIVEN `<Button loading>Save</Button>`
- WHEN rendered
- THEN a spinner icon precedes the text
- AND the button ignores click events
- AND `aria-disabled="true"` is set

### Scenario: Focus-visible ring appears on keyboard nav
- GIVEN user presses Tab to a Button
- WHEN focus lands
- THEN a 2px solid ring in `--color-brand` with 2px offset renders
- AND contrast against surface meets WCAG AA
