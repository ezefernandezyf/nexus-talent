# Modal Specification

## Purpose
Dialog overlay with backdrop blur, focus trap, escape-to-close, and motion/react animation. Apex surface tokens, Switzer headings, Geist body. motion/react isolated here with documented CSS fallback.

## Requirements

| ID | Requirement | Priority | RFC 2119 |
|----|------------|----------|----------|
| MOD-01 | Backdrop: `backdrop-blur-md` + `bg-black/50`, covers viewport, clicking backdrop closes modal | P0 | MUST |
| MOD-02 | Focus trap: Tab cycles within modal, first focusable element auto-focused on open | P0 | MUST |
| MOD-03 | Close triggers: Escape key, backdrop click, close button. `onClose` callback fires once | P0 | MUST |
| MOD-04 | Animation: enter/exit via motion/react (spring or ease-out-expo), CSS fallback documented if motion/react unavailable | P0 | MUST |
| MOD-05 | Slots: `title` (Switzer h3), `body` (Geist), `actions` (footer, right-aligned) | P0 | MUST |
| MOD-06 | Dark/light: surface `--color-surface-elevated-3`, both modes via Apex tokens | P0 | MUST |
| MOD-07 | Z-index: uses `--z-modal` (40), backdrop uses `--z-modal-backdrop` (30) | P0 | MUST |
| MOD-08 | Scroll lock: `document.body` overflow hidden while open, restored on close | P0 | MUST |
| MOD-09 | Reduced motion: `prefers-reduced-motion` disables animation, modal appears instantly | P0 | MUST |
| MOD-10 | Radius: `--radius-xl` (1.25rem) for modal panel | P1 | SHOULD |

### Scenario: Modal opens with backdrop and focus trap
- GIVEN `<Modal open onClose={fn}>` renders
- WHEN the modal opens
- THEN backdrop covers viewport with blur
- AND first focusable element inside modal receives focus
- AND Tab cycles only within modal content

### Scenario: Escape key closes modal
- GIVEN a modal is open
- WHEN user presses Escape
- THEN `onClose` callback fires
- AND scroll lock is removed from body
- AND focus returns to the trigger element

### Scenario: motion/react unavailable falls back to CSS
- GIVEN `motion/react` import fails at runtime
- WHEN Modal renders
- THEN CSS transition with `--ease-out-expo` applies
- AND open/close produces opacity + scale transition without error
