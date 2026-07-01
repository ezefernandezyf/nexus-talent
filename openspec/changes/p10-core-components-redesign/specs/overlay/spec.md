# Overlay Specification

## Purpose
Drawer (slide-out panel), Tooltip (hover), Popover (click), and Skeleton primitives. Apex tokens, motion/react for Drawer animation, portal positioning for Tooltip/Popover.

## Requirements

| ID | Requirement | Priority | RFC 2119 |
|----|------------|----------|----------|
| OVL-01 | Drawer: slide-out panel from right edge. Backdrop with `backdrop-blur-sm bg-black/40`. Focus trap, Escape to close, scroll lock | P0 | MUST |
| OVL-02 | Drawer animation: motion/react spring enter (slide-left + fade), CSS fallback documented. Exit reverses animation | P0 | MUST |
| OVL-03 | Drawer surface: `--color-surface-elevated-3`, z-index `--z-modal` (40) | P0 | MUST |
| OVL-04 | Tooltip: hover-triggered, positioned above/below target via `position` prop (top, bottom, left, right). Arrow pointer, 200ms enter delay, instant exit | P1 | SHOULD |
| OVL-05 | Popover: click-triggered, positioned near target. Focus trap, Escape to close, click outside to close | P0 | MUST |
| OVL-06 | Skeleton: shape primitives (text line, circle, rectangle). Pulse animation (`--color-surface-elevated-4` to `--color-surface-elevated-3`), dark/light variants | P1 | SHOULD |
| OVL-07 | Positioning engine: Tooltip/Popover use floating-ui or CSS anchor positioning to avoid viewport overflow | P1 | SHOULD |
| OVL-08 | Dark/light: all components use Apex surface and semantic tokens | P0 | MUST |
| OVL-09 | Typography: Tooltip/Popover body in Geist 400 text-sm, Drawer heading in Switzer h3 | P0 | MUST |
| OVL-10 | Reduced motion: all animations collapse to instant under `prefers-reduced-motion` | P0 | MUST |

### Scenario: Drawer opens with slide animation
- GIVEN `<Drawer open onClose={fn}>` renders
- WHEN open state triggers
- THEN the panel slides in from right edge with spring animation
- AND backdrop appears with blur
- AND body scroll is locked
- AND Escape key closes the drawer

### Scenario: Tooltip appears on hover
- GIVEN `<Tooltip content="Delete item"><Button>X</Button></Tooltip>`
- WHEN user hovers over the button for 200ms
- THEN tooltip renders above the button with arrow
- AND on mouse leave, tooltip disappears
- AND `role="tooltip"` is set

### Scenario: Skeleton pulse animation
- GIVEN `<Skeleton.Text lines={3} />`
- WHEN rendered in dark mode
- THEN 3 rounded rectangles render with pulse animation
- AND animation cycles between `--color-surface-elevated-4` and `--color-surface-elevated-3`
- AND under reduced motion, animation is disabled
