# Toast / Notification Specification

## Purpose
Notification system with Zustand store, provider, stacking, auto-dismiss, and animations. 4 semantic variants mapped to Apex tokens.

## Requirements

| ID | Requirement | Priority | RFC 2119 |
|----|------------|----------|----------|
| TST-01 | Store: Zustand store (`useToastStore`) with `addToast`, `removeToast`, `clearToasts` actions | P0 | MUST |
| TST-02 | Provider: `<ToastProvider>` renders active toasts in a portal, positioned bottom-right by default | P0 | MUST |
| TST-03 | Variants: success (`--color-success`), error (`--color-error`), warning (`--color-warning`), info (`--color-info`) | P0 | MUST |
| TST-04 | Auto-dismiss: each toast removes after `duration` ms (default 5000), configurable per toast | P0 | MUST |
| TST-05 | Stacking: multiple toasts stack vertically with 0.5rem gap, newest at bottom | P0 | MUST |
| TST-06 | Animation: enter (slide-up + fade), exit (slide-right + fade), 250ms `--ease-out-expo` | P1 | SHOULD |
| TST-07 | Dark/light: surface `--color-surface-elevated-4`, semantic tokens for variant colors | P0 | MUST |
| TST-08 | Typography: message in Geist 400, title (optional) in Switzer 500 | P1 | SHOULD |
| TST-09 | Z-index: uses `--z-toast` (50), above modal backdrop | P0 | MUST |
| TST-10 | Icon: variant-specific icon from `@phosphor-icons/react`, left-aligned | P1 | SHOULD |
| TST-11 | Close button: X icon on right, calls `removeToast(id)` | P1 | SHOULD |
| TST-12 | Reduced motion: animations collapse to instant appearance under `prefers-reduced-motion` | P0 | MUST |

### Scenario: Success toast auto-dismisses after duration
- GIVEN a `toastStore.addToast({ variant: "success", message: "Saved", duration: 3000 })`
- WHEN the toast renders
- THEN it appears with slide-up fade animation
- AND after 3000ms the exit animation plays and toast is removed

### Scenario: Multiple toasts stack in order
- GIVEN 3 toasts are added sequentially
- WHEN rendered
- THEN all 3 are visible, newest at bottom
- AND each auto-dismisses independently
- AND removing one shifts remaining toasts without layout jump

### Scenario: Toast respects theme
- GIVEN `html[data-theme="light"]` is set
- WHEN a success toast renders
- THEN surface uses light `--color-surface-elevated-4`
- AND `--color-success` contrast meets ≥4.5:1 against surface
